# 🦕 Deno Deploy 快速开始

## ⚡ 5 分钟部署到 Deno Deploy

### 步骤 1：安装 Deno

**Windows (PowerShell)**:
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS/Linux**:
```bash
curl -fsSL https://deno.land/install.sh | sh
```

### 步骤 2：本地测试

```bash
# 1. 构建前端
npm install
npm run build

# 2. 启动 Deno 服务器
deno task dev
```

访问 `http://localhost:8000`

### 步骤 3：推送到 GitHub

```bash
git add .
git commit -m "准备部署到 Deno Deploy"
git push
```

### 步骤 4：部署到 Deno Deploy

1. 访问 https://dash.deno.com/new
2. 点击 **"Deploy from GitHub"**
3. 选择你的仓库
4. 配置：
   - **Entry Point**: `server.ts`
   - **Install Step**: `npm install && npm run build`
5. 点击 **"Deploy"**

### 步骤 5：配置环境变量

在 Deno Deploy 项目设置中添加：

```
OPENROUTER_API_KEY=你的密钥
DINGTALK_APP_KEY=你的钉钉AppKey
DINGTALK_APP_SECRET=你的钉钉AppSecret
DINGTALK_REDIRECT_URI=https://你的项目.deno.dev/auth/callback
JWT_SECRET=随机密钥
VITE_DEV_MODE_SKIP_AUTH=false
```

生成 JWT 密钥：
```bash
deno eval "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

### 步骤 6：更新钉钉回调地址

1. 获取 Deno Deploy 域名（例如：`https://your-project.deno.dev`）
2. 更新环境变量中的 `DINGTALK_REDIRECT_URI`
3. 在钉钉开发者平台添加回调域名

---

## ✅ 完成！

访问你的 Deno Deploy 域名，应该看到钉钉登录页面！

---

## 📚 详细文档

查看 [DENO_DEPLOYMENT.md](./DENO_DEPLOYMENT.md) 获取完整指南。

