# Cloudflare Workers + Pages 部署指南（高级）

## ⚠️ 注意

这是**高级部署方案**，需要一定的技术经验。

**推荐新手使用 Vercel**，参考 `DEPLOYMENT_GUIDE_SECURE.md`。

---

## 🌟 Cloudflare 优势

- ✅ **免费额度更大**：每天 100,000 次请求
- ✅ **全球边缘网络**：性能更好，延迟更低
- ✅ **几乎零冷启动**：Workers 启动极快
- ✅ **成本更低**：适合高流量应用

---

## 🚧 技术挑战

### 1. Workers 运行时限制

Cloudflare Workers 使用 V8 引擎，**不支持 Node.js 标准库**：

- ❌ 不能使用 `fs`、`path` 等 Node.js 模块
- ❌ OpenAI SDK 可能不兼容
- ✅ 需要使用 `fetch` API 直接调用 OpenRouter

### 2. 需要重写 API 调用

不能直接使用 `openai` npm 包，需要手动构建 HTTP 请求。

---

## 📋 部署步骤

### 步骤 1：安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 步骤 2：登录 Cloudflare

```bash
wrangler login
```

### 步骤 3：创建 Workers 配置

创建 `wrangler.toml`：

```toml
name = "jewelry-generator"
main = "functions/[[path]].ts"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[vars]
ENVIRONMENT = "production"
```

### 步骤 4：创建 Workers 函数

#### `functions/api/analyze.ts`

```typescript
export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { base64Image, promptConfig } = await request.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: base64Image } },
              {
                type: 'text',
                text: `${promptConfig.analysisPrompt.systemRole}
                Return a JSON object with analysis results.`
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    return new Response(content, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

#### `functions/api/generate.ts`

```typescript
export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { config, referenceImage, promptConfig } = await request.json();

    // 构建提示词
    const textPrompt = `
      ${promptConfig.generationPrompt.systemRole}
      Material: ${config.material}
      Craftsmanship: ${config.craftsmanship}
      ${promptConfig.generationPrompt.outputRequirements}
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              ...(referenceImage ? [{ type: 'image_url', image_url: { url: referenceImage } }] : []),
              { type: 'text', text: textPrompt }
            ]
          }
        ],
        modalities: ['image', 'text'],
        image_config: { aspect_ratio: config.aspectRatio }
      })
    });

    const data = await response.json();
    const images = data.choices[0]?.message?.images;
    
    if (images && images.length > 0) {
      return new Response(JSON.stringify({ imageUrl: images[0].image_url.url }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw new Error('No image generated');

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### 步骤 5：配置环境变量

```bash
wrangler secret put OPENROUTER_API_KEY
```

输入你的 OpenRouter API Key。

### 步骤 6：部署

```bash
# 构建前端
npm run build

# 部署到 Cloudflare
wrangler pages deploy dist
```

---

## 🔧 项目结构

```
your-project/
├── functions/           # Cloudflare Workers 函数
│   └── api/
│       ├── analyze.ts
│       └── generate.ts
├── src/                 # React 前端代码
├── dist/                # 构建输出
├── wrangler.toml        # Cloudflare 配置
└── package.json
```

---

## 💡 优化建议

### 1. 添加缓存

```typescript
// 在 Workers 中添加缓存
const cache = await caches.open('api-cache');
const cachedResponse = await cache.match(request);
if (cachedResponse) {
  return cachedResponse;
}
```

### 2. 添加速率限制

使用 Cloudflare KV 存储请求计数。

### 3. 错误处理

添加详细的错误日志和监控。

---

## 📊 成本对比

| 服务 | 免费额度 | 超出费用 |
|------|---------|---------|
| Cloudflare Workers | 100,000 请求/天 | $0.50 / 百万请求 |
| Vercel | 100 次/天 | 需升级套餐 |

---

## ⚠️ 注意事项

1. **Workers 限制**：
   - 单次执行时间限制：50ms（免费版）
   - CPU 时间限制：10ms
   - 可能不适合长时间的图片生成

2. **兼容性**：
   - 需要手动处理所有 HTTP 请求
   - 不能使用 npm 包中依赖 Node.js 的功能

3. **调试**：
   - 使用 `wrangler dev` 本地测试
   - 查看 Cloudflare Dashboard 日志

---

## 🆚 何时选择 Cloudflare

**选择 Cloudflare 如果**：
- ✅ 你有高流量需求
- ✅ 你熟悉 Workers 开发
- ✅ 你需要极致性能

**选择 Vercel 如果**：
- ✅ 你是新手
- ✅ 你想快速部署
- ✅ 你的流量不大

---

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

**推荐**：如果你不确定，先使用 Vercel 部署，等流量增长后再考虑迁移到 Cloudflare。

