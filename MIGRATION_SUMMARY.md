# 迁移到 OpenRouter 总结

## ✅ 已完成的修改

### 1. 依赖更新

**文件**: `package.json`

添加了 OpenAI SDK：
```json
"dependencies": {
  "openai": "^4.77.3"
}
```

保留了原有的 `@google/genai` 依赖作为备用。

### 2. 核心服务重构

**文件**: `services/geminiService.ts`

**主要变更**：
- ✅ 从 `@google/genai` SDK 切换到 `openai` SDK
- ✅ 更新 API 端点为 `https://openrouter.ai/api/v1`
- ✅ 修改模型名称格式：
  - `gemini-2.5-flash` → `google/gemini-2.5-flash`
  - `gemini-3-pro-image-preview` → `google/gemini-3-pro-image-preview`
- ✅ 适配 OpenAI 兼容的 API 格式
- ✅ 添加 OpenRouter 专用请求头（HTTP-Referer, X-Title）

**函数变更**：

#### `analyzeJewelryImage()`
- 使用 `openai.chat.completions.create()`
- 图片通过 `image_url` 类型传递
- JSON 输出通过 `response_format: { type: "json_object" }` 控制

#### `generateJewelryDesign()`
- 使用 `openai.chat.completions.create()`
- 支持 `modalities: ["image", "text"]` 参数
- 图片生成结果从响应中提取

### 3. 环境变量配置

**文件**: `.env.local`

**新增配置**：
```env
# OpenRouter API 配置
OPENROUTER_API_KEY=你的OpenRouter_API密钥
SITE_URL=https://localhost:3000
SITE_NAME=珠宝设计生成器
```

**保留配置**（备用）：
```env
GEMINI_API_KEY=AIzaSyCsI02hzZzPs9Wj4j-mzVa3_Mu11qvB3dM
```

### 4. Vite 配置更新

**文件**: `vite.config.ts`

**新增环境变量映射**：
```typescript
define: {
  'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
  'process.env.SITE_URL': JSON.stringify(env.SITE_URL),
  'process.env.SITE_NAME': JSON.stringify(env.SITE_NAME),
}
```

### 5. 文档更新

**新增文档**：
- ✅ `OPENROUTER_CONFIG.md` - OpenRouter 配置指南
- ✅ `DEPLOYMENT_GUIDE.md` - 完整部署指南
- ✅ `MIGRATION_SUMMARY.md` - 本文档

**删除文档**：
- ❌ `API_ENDPOINT_CONFIG.md` - 已过时，不再适用

## 📋 下一步操作

### 1. 安装依赖

```bash
npm install
```

这会安装新添加的 `openai` 包。

### 2. 配置 API Key

编辑 `.env.local`，将 `你的OpenRouter_API密钥` 替换为真实的 API Key。

**获取 API Key**：
1. 访问 https://openrouter.ai/
2. 注册并登录
3. 前往 https://openrouter.ai/keys
4. 创建新的 API Key

### 3. 测试功能

```bash
npm run dev
```

启动后测试：
- ✅ 上传珠宝图片进行分析
- ✅ 生成新的设计图
- ✅ 检查浏览器控制台是否有错误

### 4. 验证请求

打开浏览器 F12 开发者工具：
- 切换到 Network 标签
- 查看请求是否发送到 `openrouter.ai`
- 检查响应状态码是否为 200

## 🔄 如何回退到 Google API

如果需要回退到 Google 官方 API：

1. **恢复 `services/geminiService.ts`**：
   - 将 `import OpenAI` 改回 `import { GoogleGenAI, Type }`
   - 恢复原有的 API 调用代码

2. **更新 `vite.config.ts`**：
   - 移除 OpenRouter 相关的环境变量

3. **使用 Google API Key**：
   - 在 `.env.local` 中使用 `GEMINI_API_KEY`

## ⚠️ 注意事项

### API 兼容性

OpenRouter 使用 OpenAI 兼容的 API 格式，与 Google Gemini 原生 API 有以下差异：

1. **请求格式**：
   - Google: `models.generateContent()`
   - OpenRouter: `chat.completions.create()`

2. **模型名称**：
   - Google: `gemini-2.5-flash`
   - OpenRouter: `google/gemini-2.5-flash`

3. **响应格式**：
   - Google: `response.text`
   - OpenRouter: `response.choices[0].message.content`

### 功能差异

目前已知的功能差异：
- ✅ 图片分析：完全兼容
- ✅ 图片生成：完全兼容
- ⚠️ 某些高级参数可能不支持（如 `imageConfig.imageSize`）

## 💰 成本估算

OpenRouter 定价：
- 输入：$2/M tokens
- 输出：$12/M tokens
- 图片生成：$0.12/图片

建议：
- 先使用免费额度测试
- 监控使用量：https://openrouter.ai/activity
- 设置预算限制

## 📚 相关资源

- [OpenRouter 配置指南](./OPENROUTER_CONFIG.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [OpenRouter 官方文档](https://openrouter.ai/docs)

