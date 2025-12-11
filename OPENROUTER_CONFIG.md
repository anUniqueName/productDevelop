# OpenRouter API 配置指南

本项目已切换到使用 **OpenRouter** 作为 API 提供商，通过 OpenRouter 访问 Google Gemini 模型。

## 🎯 为什么使用 OpenRouter？

- ✅ **统一接口**：通过一个 API 访问多个 AI 模型
- ✅ **更好的稳定性**：多提供商自动故障转移
- ✅ **透明计费**：按使用量付费，价格清晰
- ✅ **无地区限制**：绕过某些地区的访问限制

## 📋 快速开始

### 1. 获取 OpenRouter API Key

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并登录
3. 前往 [API Keys 页面](https://openrouter.ai/keys)
4. 点击 "Create Key" 创建新的 API Key
5. 复制生成的 API Key

### 2. 配置环境变量

编辑 `.env.local` 文件：

```env
# OpenRouter API 配置
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选：站点信息（用于 OpenRouter 排行榜）
SITE_URL=https://your-site.com
SITE_NAME=珠宝设计生成器
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动项目

```bash
npm run dev
```

## 💰 定价信息

OpenRouter 使用的 Gemini 模型定价：

| 模型 | 用途 | 输入价格 | 输出价格 | 图片价格 |
|------|------|---------|---------|---------|
| `google/gemini-2.5-flash` | 图片分析 | $2/M tokens | $12/M tokens | - |
| `google/gemini-3-pro-image-preview` | 图片生成 | $2/M tokens | $12/M tokens | $0.12/图片 |

💡 **提示**：OpenRouter 提供免费额度供测试使用。

## 🔧 技术细节

### 使用的模型

1. **图片分析**：`google/gemini-2.5-flash`
   - 分析上传的珠宝图片
   - 提取设计元素、材质、风格等信息
   - 返回 JSON 格式的分析结果

2. **图片生成**：`google/gemini-3-pro-image-preview`
   - 根据设计参数生成珠宝设计图
   - 支持参考图片
   - 返回高质量的产品渲染图

### API 端点

- **Base URL**：`https://openrouter.ai/api/v1`
- **格式**：OpenAI 兼容 API
- **认证**：Bearer Token（API Key）

### 代码实现

项目使用 OpenAI SDK 调用 OpenRouter API：

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL,
    "X-Title": process.env.SITE_NAME,
  }
});
```

## 🧪 测试配置

1. **配置 API Key**：编辑 `.env.local`
2. **重启服务**：`npm run dev`
3. **验证功能**：
   - 上传珠宝图片进行分析
   - 生成新的设计图
4. **检查请求**：
   - 打开浏览器 F12 开发者工具
   - 切换到 Network 标签
   - 查看请求是否发送到 `openrouter.ai`

## ⚠️ 常见问题

### Q: API Key 无效怎么办？
A: 确保：
1. API Key 格式正确（以 `sk-or-v1-` 开头）
2. 在 OpenRouter 账户中有足够的余额
3. API Key 没有被撤销

### Q: 请求失败怎么办？
A: 检查：
1. 网络连接是否正常
2. API Key 是否正确配置
3. 浏览器控制台是否有错误信息
4. OpenRouter 服务状态：https://status.openrouter.ai/

### Q: 如何查看使用量和费用？
A: 登录 [OpenRouter Dashboard](https://openrouter.ai/activity) 查看详细的使用统计和费用。

### Q: 可以切换回 Google 官方 API 吗？
A: 可以，但需要修改 `services/geminiService.ts` 代码，将 OpenAI SDK 改回 Google SDK。

## 📚 相关资源

- [OpenRouter 官网](https://openrouter.ai/)
- [OpenRouter 文档](https://openrouter.ai/docs)
- [OpenRouter API 参考](https://openrouter.ai/docs/api-reference)
- [模型列表](https://openrouter.ai/models)
- [定价信息](https://openrouter.ai/models?q=gemini)

## 🔐 安全提示

- ⚠️ **不要**将 API Key 提交到 Git 仓库
- ⚠️ **不要**在前端代码中硬编码 API Key
- ✅ 使用 `.env.local` 文件存储敏感信息
- ✅ 将 `.env.local` 添加到 `.gitignore`

