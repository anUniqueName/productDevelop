# 🚀 Vercel 部署指南

## 📋 部署前准备

### 1. 配置钉钉应用

1. 访问 [钉钉开发者平台](https://open-dev.dingtalk.com/)
2. 创建企业内部应用
3. 获取 **AppKey** 和 **AppSecret**
4. 先暂时配置回调地址为：`http://localhost:3000`（部署后再改）

### 2. 生成 JWT 密钥

在终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制生成的密钥备用。

---

## 🚀 部署到 Vercel（5 分钟）

### 步骤 1：推送代码到 GitHub

```bash
git add .
git commit -m "准备部署到 Vercel"
git push
```

### 步骤 2：导入到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 **"Add New Project"**
3. 选择你的 GitHub 仓库
4. 点击 **"Import"**

### 步骤 3：配置环境变量

在 Vercel 项目设置页面，添加以下环境变量：

#### 必需的环境变量：

```
OPENROUTER_API_KEY=sk-or-v1-你的OpenRouter密钥

DINGTALK_APP_KEY=你的钉钉AppKey
DINGTALK_APP_SECRET=你的钉钉AppSecret
DINGTALK_REDIRECT_URI=https://你的项目名.vercel.app/auth/callback

JWT_SECRET=刚才生成的随机密钥
```

#### 可选的环境变量：

```
PROMPT_CONFIG_TYPE=jewelry
VITE_DEV_MODE_SKIP_AUTH=false
```

⚠️ **重要**：
- `DINGTALK_REDIRECT_URI` 中的域名要等部署完成后才知道
- 先随便填一个，部署后再改

### 步骤 4：部署

点击 **"Deploy"** 按钮，等待部署完成（约 1-2 分钟）。

### 步骤 5：更新钉钉回调地址

1. 部署完成后，Vercel 会给你一个域名，例如：`https://your-project.vercel.app`
2. 回到 Vercel 项目设置，更新环境变量：
   ```
   DINGTALK_REDIRECT_URI=https://your-project.vercel.app/auth/callback
   ```
3. 保存后，点击 **"Redeploy"** 重新部署

4. 回到钉钉开发者平台，在应用设置中添加回调域名：
   ```
   https://your-project.vercel.app
   ```

---

## ✅ 测试部署

1. 访问你的 Vercel 域名：`https://your-project.vercel.app`
2. 应该看到钉钉登录页面
3. 点击"使用钉钉登录"
4. 扫码登录后，应该能正常访问应用

---

## 🔧 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OPENROUTER_API_KEY` | OpenRouter API 密钥 | `sk-or-v1-xxx...` |
| `DINGTALK_APP_KEY` | 钉钉应用 AppKey | `dingxxx...` |
| `DINGTALK_APP_SECRET` | 钉钉应用 AppSecret | `xxx...` |
| `DINGTALK_REDIRECT_URI` | 钉钉回调地址 | `https://xxx.vercel.app/auth/callback` |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串（至少 32 位） |
| `VITE_DEV_MODE_SKIP_AUTH` | 开发模式（跳过登录） | `false`（生产环境必须为 false） |
| `PROMPT_CONFIG_TYPE` | 提示词配置类型 | `jewelry` / `generic` / `fashion` |

---

## 🐛 常见问题

### Q1: 部署后提示"redirect_uri 不匹配"

**解决方法**：
1. 检查 Vercel 环境变量中的 `DINGTALK_REDIRECT_URI` 是否正确
2. 检查钉钉应用中是否添加了回调域名
3. 重新部署

### Q2: 部署后提示"Invalid token"

**解决方法**：
1. 检查 `JWT_SECRET` 是否配置
2. 确保 `JWT_SECRET` 是随机字符串（至少 32 位）
3. 重新部署

### Q3: 部署后无法登录

**解决方法**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 和 Network 标签的错误信息
3. 检查所有环境变量是否正确配置

---

## 📝 本地开发 vs 生产环境

### 本地开发（`.env.local`）

```env
# 开发模式：跳过登录
VITE_DEV_MODE_SKIP_AUTH=true

# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-xxx...
```

### 生产环境（Vercel 环境变量）

```env
# 必须关闭开发模式
VITE_DEV_MODE_SKIP_AUTH=false

# 完整的钉钉配置
DINGTALK_APP_KEY=xxx
DINGTALK_APP_SECRET=xxx
DINGTALK_REDIRECT_URI=https://xxx.vercel.app/auth/callback
JWT_SECRET=xxx

# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-xxx...
```

---

## 🎊 完成！

现在你的应用已经部署到 Vercel，并且集成了钉钉登录认证！

需要帮助？查看 [DINGTALK_AUTH_GUIDE.md](./DINGTALK_AUTH_GUIDE.md) 获取更多详细信息。

