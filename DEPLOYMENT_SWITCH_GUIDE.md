# 部署模式切换指南

## 📋 概述

你的项目现在支持两种运行模式：

1. **本地开发模式**：使用 `geminiService.ts`（直接调用 OpenRouter）
2. **生产部署模式**：使用 `geminiService.secure.ts`（通过后端 API 调用）

---

## 🔄 如何切换到安全部署模式

### 步骤 1：安装依赖

```bash
npm install @vercel/node --save-dev
```

### 步骤 2：修改导入路径

需要修改以下文件中的导入语句：

#### 文件 1: `hooks/useJewelryAnalysis.ts`

**查找**：
```typescript
import { analyzeJewelryImage } from '../services/geminiService';
```

**替换为**：
```typescript
import { analyzeJewelryImage } from '../services/geminiService.secure';
```

#### 文件 2: `hooks/useJewelryGenerator.ts`

**查找**：
```typescript
import { generateJewelryDesign } from '../services/geminiService';
```

**替换为**：
```typescript
import { generateJewelryDesign } from '../services/geminiService.secure';
```

### 步骤 3：测试本地开发

在部署前，先在本地测试后端 API：

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **测试 API 路由**：
   - 打开浏览器开发者工具（F12）
   - 上传图片进行分析
   - 检查 Network 标签，应该看到请求发送到 `/api/analyze`

3. **如果遇到 CORS 错误**：
   - 这是正常的，因为本地开发时前端和 API 在不同端口
   - 部署到 Vercel 后会自动解决

### 步骤 4：部署到 Vercel

按照 `DEPLOYMENT_GUIDE_SECURE.md` 中的步骤部署。

---

## 🔙 如何切换回本地开发模式

如果你只想在本地运行（不部署），可以保持使用 `geminiService.ts`：

1. **不需要修改任何导入**
2. **确保 `.env.local` 中有 API Key**
3. **运行 `npm run dev`**

---

## 📊 两种模式对比

| 特性 | 本地开发模式 | 生产部署模式 |
|------|-------------|-------------|
| 文件 | `geminiService.ts` | `geminiService.secure.ts` |
| API 调用 | 浏览器直接调用 | 通过后端 API |
| API Key | 暴露在前端 | 隐藏在服务器 |
| 安全性 | ⚠️ 不安全 | ✅ 安全 |
| 适用场景 | 本地开发/测试 | 公开部署 |
| 需要后端 | ❌ 不需要 | ✅ 需要 |

---

## 🛠️ 完整的文件修改清单

### 需要修改的文件（切换到部署模式）

- [ ] `hooks/useJewelryAnalysis.ts` - 修改导入路径
- [ ] `hooks/useJewelryGenerator.ts` - 修改导入路径
- [ ] `package.json` - 已添加 `@vercel/node`

### 已创建的新文件

- [x] `api/analyze.ts` - 分析 API 路由
- [x] `api/generate.ts` - 生成 API 路由
- [x] `services/geminiService.secure.ts` - 安全版本服务
- [x] `vercel.json` - Vercel 配置
- [x] `.env.example` - 环境变量示例

---

## 🧪 测试检查清单

### 本地测试

- [ ] 安装依赖：`npm install`
- [ ] 修改导入路径
- [ ] 启动开发服务器：`npm run dev`
- [ ] 上传图片测试分析功能
- [ ] 测试图片生成功能
- [ ] 检查浏览器控制台无错误

### Vercel 部署测试

- [ ] 推送代码到 GitHub
- [ ] 在 Vercel 导入项目
- [ ] 配置环境变量 `OPENROUTER_API_KEY`
- [ ] 部署成功
- [ ] 访问部署 URL 测试功能
- [ ] 检查 API Key 未暴露（开发者工具 → Sources）

---

## ⚠️ 重要提醒

### 1. 不要同时使用两种模式

- 选择一种模式并坚持使用
- 本地开发可以用不安全模式
- 公开部署**必须**用安全模式

### 2. 环境变量配置

**本地开发**：
- 在 `.env.local` 中配置 `OPENROUTER_API_KEY`

**Vercel 部署**：
- 在 Vercel Dashboard 中配置环境变量
- **不要**将 `.env.local` 提交到 Git

### 3. API 路由路径

- 本地开发：`http://localhost:3000/api/analyze`
- Vercel 部署：`https://your-app.vercel.app/api/analyze`

`geminiService.secure.ts` 会自动处理这个差异。

---

## 🐛 常见问题

### 问题 1：本地测试时 API 调用失败

**原因**：Vite 开发服务器默认不支持 API 路由

**解决方案**：
1. 使用 Vercel CLI 本地测试：
   ```bash
   npm install -g vercel
   vercel dev
   ```
2. 或者直接部署到 Vercel 测试

### 问题 2：部署后 API 调用 404

**原因**：API 路由文件位置不正确

**解决方案**：
- 确保 `api/` 目录在项目根目录
- 检查 `vercel.json` 配置

### 问题 3：环境变量未生效

**原因**：Vercel 环境变量未配置

**解决方案**：
1. 登录 Vercel Dashboard
2. 进入项目设置 → Environment Variables
3. 添加 `OPENROUTER_API_KEY`
4. 重新部署

---

## 📚 相关文档

- [DEPLOYMENT_GUIDE_SECURE.md](./DEPLOYMENT_GUIDE_SECURE.md) - 完整部署指南
- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

需要帮助？查看完整的部署指南或联系支持！

