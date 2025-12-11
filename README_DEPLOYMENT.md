# 部署指南总览

## 🎯 选择你的部署方案

### 🌟 推荐方案：Vercel（新手友好）

**适合**：个人项目、中小型应用、快速原型

**优点**：
- ✅ 5 分钟快速部署
- ✅ 自动 HTTPS 和 CDN
- ✅ 与 GitHub 自动集成
- ✅ 免费额度足够使用

**开始部署**：
- 📖 [快速开始（5 分钟）](./QUICK_START_DEPLOYMENT.md)
- 📖 [完整部署指南](./DEPLOYMENT_GUIDE_SECURE.md)

---

### ⚡ 高级方案：Cloudflare Workers + Pages

**适合**：高流量应用、需要极致性能

**优点**：
- ✅ 免费额度更大（100,000 请求/天）
- ✅ 全球边缘网络
- ✅ 几乎零冷启动

**缺点**：
- ⚠️ 配置相对复杂
- ⚠️ 需要手动处理 HTTP 请求

**开始部署**：
- 📖 [Cloudflare 部署指南](./DEPLOYMENT_CLOUDFLARE.md)

---

## 🔒 为什么需要安全部署？

### ⚠️ 当前架构的问题

你的应用目前使用 `dangerouslyAllowBrowser: true`，这意味着：

```
❌ API Key 暴露在前端代码中
❌ 任何人都能窃取你的 API Key
❌ 可能导致巨额费用
```

### ✅ 安全架构

```
前端 (React) → 后端 API → OpenRouter
                ↑
           API Key 安全存储
```

**优点**：
- ✅ API Key 只存在于服务器
- ✅ 前端无法访问
- ✅ 可以添加访问控制

---

## 📋 部署前准备

### 1. 获取 OpenRouter API Key

1. 访问 https://openrouter.ai/keys
2. 注册并登录
3. 创建新的 API Key
4. 复制 API Key（格式：`sk-or-v1-...`）

### 2. 安装依赖

```bash
npm install @vercel/node --save-dev
```

### 3. 修改代码

需要修改 2 个文件的导入路径：

**文件 1**: `hooks/useJewelryAnalysis.ts`
```typescript
// 修改前
import { analyzeJewelryImage } from '../services/geminiService';

// 修改后
import { analyzeJewelryImage } from '../services/geminiService.secure';
```

**文件 2**: `hooks/useJewelryGenerator.ts`
```typescript
// 修改前
import { generateJewelryDesign } from '../services/geminiService';

// 修改后
import { generateJewelryDesign } from '../services/geminiService.secure';
```

---

## 🚀 快速部署（Vercel）

### 方法一：通过 Vercel Dashboard

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库
3. 添加环境变量：`OPENROUTER_API_KEY`
4. 点击 Deploy
5. 完成！

### 方法二：通过 CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量
vercel env add OPENROUTER_API_KEY

# 生产部署
vercel --prod
```

---

## 📊 方案对比

| 特性 | Vercel | Cloudflare |
|------|--------|-----------|
| 难度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 免费额度 | 100 次/天 | 100,000 次/天 |
| 部署时间 | 5 分钟 | 30 分钟 |
| 性能 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 极好 |
| 兼容性 | ✅ 完美 | ⚠️ 需要适配 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 📚 文档索引

### 快速开始
- 📖 [5 分钟快速部署](./QUICK_START_DEPLOYMENT.md) - **推荐新手**

### 详细指南
- 📖 [Vercel 完整部署指南](./DEPLOYMENT_GUIDE_SECURE.md)
- 📖 [部署模式切换指南](./DEPLOYMENT_SWITCH_GUIDE.md)
- 📖 [Cloudflare 部署指南](./DEPLOYMENT_CLOUDFLARE.md)

### 配置说明
- 📖 [提示词自定义指南](./PROMPT_CUSTOMIZATION_GUIDE.md)
- 📖 [界面提示词编辑器](./UI_PROMPT_EDITOR_GUIDE.md)

---

## 💰 成本估算

### Vercel 免费版

- ✅ 100 GB 带宽/月
- ✅ 100 次 Serverless Function 调用/天
- ✅ 无限静态托管

**适合**：个人项目、小型应用

### Cloudflare 免费版

- ✅ 100,000 次请求/天
- ✅ 无限带宽
- ✅ 全球 CDN

**适合**：高流量应用

### OpenRouter API 费用

- 图片分析：$0.001 - $0.01 / 次
- 图片生成：$0.05 - $0.15 / 次

**建议**：设置每月预算限制（例如 $10 - $50）

---

## 🔐 安全最佳实践

### 1. 环境变量管理

- ✅ 永远不要将 `.env.local` 提交到 Git
- ✅ 在部署平台配置环境变量
- ✅ 定期轮换 API Key

### 2. 访问控制

- ✅ 添加速率限制
- ✅ 监控异常流量
- ✅ 设置 API 使用限额

### 3. 监控和日志

- ✅ 查看部署平台的日志
- ✅ 监控 OpenRouter 使用情况
- ✅ 设置告警通知

---

## 🐛 故障排除

### 部署失败

**检查**：
- 依赖是否正确安装
- 本地构建是否成功
- 环境变量是否配置

### API 调用失败

**检查**：
- 环境变量是否正确
- API Key 是否有效
- 网络连接是否正常

### 功能异常

**检查**：
- 导入路径是否修改
- 浏览器控制台错误
- 部署平台日志

---

## 🎯 推荐流程

```
1. 阅读快速开始指南
   ↓
2. 准备 OpenRouter API Key
   ↓
3. 修改代码导入路径
   ↓
4. 部署到 Vercel
   ↓
5. 测试验证
   ↓
6. 完成！
```

**总耗时**：约 10 分钟

---

## 📞 获取帮助

- 📖 查看详细文档
- 🐛 检查故障排除部分
- 💬 查看 Vercel/Cloudflare 官方文档

---

## 🎊 开始部署

选择你的方案，开始部署吧！

- 🚀 [快速开始（Vercel）](./QUICK_START_DEPLOYMENT.md)
- ⚡ [高级部署（Cloudflare）](./DEPLOYMENT_CLOUDFLARE.md)

祝你部署顺利！🎉

