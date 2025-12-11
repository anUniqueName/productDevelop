# 🚀 快速部署到 Vercel（5 分钟）

## 📋 前提条件

- ✅ GitHub 账号
- ✅ OpenRouter API Key（[获取地址](https://openrouter.ai/keys)）

---

## 🎯 部署步骤

### 1️⃣ 准备代码（2 分钟）

#### 安装依赖

```bash
npm install @vercel/node --save-dev
```

#### 修改导入路径

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

#### 提交代码

```bash
git add .
git commit -m "准备部署到 Vercel"
git push
```

---

### 2️⃣ 部署到 Vercel（3 分钟）

#### 步骤 1：导入项目

1. 访问 https://vercel.com/new
2. 点击 **"Import Git Repository"**
3. 选择你的 GitHub 仓库
4. 点击 **"Import"**

#### 步骤 2：配置项目

- **Framework Preset**: 选择 `Vite`
- **Build Command**: `npm run build`（自动检测）
- **Output Directory**: `dist`（自动检测）

#### 步骤 3：添加环境变量

在 **"Environment Variables"** 部分：

| Name | Value |
|------|-------|
| `OPENROUTER_API_KEY` | `sk-or-v1-你的API密钥` |

#### 步骤 4：部署

1. 点击 **"Deploy"** 按钮
2. 等待 1-2 分钟
3. 部署完成！🎉

---

## ✅ 验证部署

### 1. 访问你的应用

Vercel 会给你一个 URL，例如：
```
https://your-app.vercel.app
```

### 2. 测试功能

1. **上传图片**进行分析
2. **生成新设计**
3. 打开浏览器开发者工具（F12）
4. 检查 **Network** 标签：
   - ✅ 应该看到请求发送到 `/api/analyze` 和 `/api/generate`
   - ✅ **不应该**看到 OpenRouter API Key

### 3. 检查安全性

1. 打开开发者工具 → **Sources** 标签
2. 搜索 `sk-or-v1`（你的 API Key 前缀）
3. ✅ **应该找不到**任何结果

---

## 🎊 完成！

你的应用已经安全部署到 Vercel 了！

### 下一步

- 📊 在 Vercel Dashboard 查看访问统计
- 🔒 在 OpenRouter 设置使用限额
- 🌐 绑定自定义域名（可选）

---

## 🔄 后续更新

每次修改代码后：

```bash
git add .
git commit -m "更新描述"
git push
```

Vercel 会**自动重新部署**！

---

## 💰 成本估算

### Vercel 免费版

- ✅ 100 GB 带宽/月
- ✅ 100 次 Serverless Function 调用/天
- ✅ 无限静态托管

### OpenRouter 费用

- 图片分析：约 $0.001 - $0.01 / 次
- 图片生成：约 $0.05 - $0.15 / 次

**建议**：在 OpenRouter 设置每月预算限制（例如 $10）

---

## 🐛 遇到问题？

### 问题 1：部署失败

**检查**：
- `package.json` 中的依赖是否正确
- 本地 `npm run build` 是否成功

### 问题 2：API 调用失败

**检查**：
- Vercel 环境变量是否正确配置
- OpenRouter API Key 是否有效

### 问题 3：功能不正常

**检查**：
- 是否修改了导入路径
- 浏览器控制台是否有错误

---

## 📚 详细文档

- [完整部署指南](./DEPLOYMENT_GUIDE_SECURE.md)
- [部署模式切换](./DEPLOYMENT_SWITCH_GUIDE.md)
- [Cloudflare 部署](./DEPLOYMENT_CLOUDFLARE.md)

---

## 🎯 总结

```
1. 安装依赖 → 2. 修改导入 → 3. 推送代码 → 4. Vercel 部署 → 5. 完成！
```

**总耗时**：约 5 分钟

**安全性**：✅ API Key 完全隐藏

**成本**：✅ 免费（小流量）

---

开始部署吧！🚀

