# 安全部署指南

## 🔒 安全问题说明

### ⚠️ 当前架构的问题

你的应用目前使用 `dangerouslyAllowBrowser: true`，这意味着：

- ❌ **API Key 暴露**：API Key 会被编译到前端 JavaScript 中
- ❌ **容易被窃取**：任何人打开浏览器开发者工具都能看到
- ❌ **滥用风险**：攻击者可以窃取并无限制使用你的 API Key
- ❌ **费用风险**：可能导致巨额 API 调用费用

**这在公开部署时是极度不安全的！**

---

## ✅ 安全架构

我们需要改造成这样的架构：

```
┌─────────┐      ┌──────────────┐      ┌──────────────┐
│  前端   │ ───> │  后端 API    │ ───> │  OpenRouter  │
│ (React) │      │  (Serverless)│      │     API      │
└─────────┘      └──────────────┘      └──────────────┘
                        ↑
                   API Key 存储在
                   服务器环境变量中
```

**优点**：
- ✅ API Key 只存在于服务器端
- ✅ 前端无法访问 API Key
- ✅ 可以添加访问控制和速率限制
- ✅ 安全且符合最佳实践

---

## 🚀 部署方案对比

### 方案一：Vercel（推荐）

**优点**：
- ✅ 简单易用，一键部署
- ✅ 自动 HTTPS 和全球 CDN
- ✅ Serverless Functions 支持 Node.js
- ✅ 可以直接使用 OpenAI SDK
- ✅ 免费额度足够个人使用
- ✅ 与 GitHub 集成，自动部署

**缺点**：
- ⚠️ 免费版有调用次数限制
- ⚠️ 冷启动可能稍慢

**适合场景**：
- 个人项目
- 中小型应用
- 快速原型

---

### 方案二：Cloudflare Workers + Pages（高级）

**优点**：
- ✅ 免费额度更大（每天 100,000 次请求）
- ✅ 全球边缘网络，性能更好
- ✅ 几乎零冷启动时间

**缺点**：
- ⚠️ Workers 不支持 Node.js 标准库
- ⚠️ OpenAI SDK 可能不兼容
- ⚠️ 需要使用 fetch API 直接调用
- ⚠️ 配置相对复杂

**适合场景**：
- 高流量应用
- 需要极致性能
- 熟悉 Cloudflare 生态

---

## 📋 推荐方案：Vercel

基于以下原因，我推荐使用 **Vercel**：

1. **简单易用**：配置简单，部署快速
2. **兼容性好**：可以直接使用现有的 OpenAI SDK
3. **文档完善**：社区支持好，问题容易解决
4. **免费额度**：对于个人项目完全够用

---

## 🛠️ Vercel 部署步骤

### 步骤 1：准备工作

1. **注册 Vercel 账号**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **安装 Vercel CLI**（可选）
   ```bash
   npm install -g vercel
   ```

### 步骤 2：项目改造（已为你准备好）

我已经为你创建了以下文件：

- ✅ `vercel.json` - Vercel 配置文件
- ✅ `api/analyze.ts` - 图片分析 API 路由
- ✅ `api/generate.ts` - 图片生成 API 路由
- ✅ 修改后的 `services/geminiService.ts` - 调用后端 API

### 步骤 3：部署到 Vercel

#### 方法一：通过 Vercel Dashboard（推荐）

1. **导入项目**
   - 访问 https://vercel.com/new
   - 选择 "Import Git Repository"
   - 连接你的 GitHub 仓库

2. **配置环境变量**
   - 在 "Environment Variables" 部分添加：
     ```
     OPENROUTER_API_KEY = sk-or-v1-你的API密钥
     ```

3. **部署设置**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **点击 Deploy**
   - 等待部署完成（通常 1-2 分钟）
   - 获得部署 URL（例如：`https://your-app.vercel.app`）

#### 方法二：通过 CLI

```bash
# 登录 Vercel
vercel login

# 部署
vercel

# 添加环境变量
vercel env add OPENROUTER_API_KEY

# 生产部署
vercel --prod
```

### 步骤 4：验证部署

1. 访问你的部署 URL
2. 上传图片进行分析
3. 生成新的设计图
4. 检查浏览器开发者工具 → Network 标签
   - 应该看到请求发送到 `/api/analyze` 和 `/api/generate`
   - **不应该**看到 OpenRouter API Key

---

## 🔐 安全最佳实践

### 1. 环境变量管理

- ✅ **永远不要**将 `.env.local` 提交到 Git
- ✅ 确保 `.gitignore` 包含 `.env.local`
- ✅ 在 Vercel Dashboard 中配置环境变量

### 2. API 访问控制（可选）

在 `api/analyze.ts` 和 `api/generate.ts` 中添加：

```typescript
// 速率限制
// CORS 配置
// 身份验证
```

### 3. 监控和日志

- 在 Vercel Dashboard 查看函数调用日志
- 设置 OpenRouter 的使用限额
- 监控异常流量

---

## 📊 成本估算

### Vercel 免费版限制

- ✅ 100 GB 带宽/月
- ✅ 100 次 Serverless Function 调用/天
- ✅ 无限静态托管

### OpenRouter 费用

- 图片分析：约 $0.001 - $0.01 / 次
- 图片生成：约 $0.05 - $0.15 / 次

**估算**：
- 每天 10 次分析 + 10 次生成 ≈ $1 - $2 / 天
- 建议在 OpenRouter 设置每月预算限制

---

## 🐛 故障排除

### 问题 1：部署失败

**解决方案**：
- 检查 `package.json` 中的依赖
- 确保 `npm run build` 在本地可以成功
- 查看 Vercel 部署日志

### 问题 2：API 调用失败

**解决方案**：
- 检查环境变量是否正确配置
- 查看 Vercel Functions 日志
- 确认 OpenRouter API Key 有效

### 问题 3：CORS 错误

**解决方案**：
- 已在 API 路由中配置 CORS
- 如果仍有问题，检查 `vercel.json` 配置

---

## 📚 相关文档

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [OpenRouter API 文档](https://openrouter.ai/docs)

---

需要帮助？查看下一步的具体实现文件！

