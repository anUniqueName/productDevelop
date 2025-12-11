# 🦕 Deno Deploy 部署指南

## 📋 部署前准备

### 1. 安装 Deno

访问 https://deno.land/ 安装 Deno。

**Windows (PowerShell)**:
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS/Linux**:
```bash
curl -fsSL https://deno.land/install.sh | sh
```

### 2. 配置钉钉应用

1. 访问 [钉钉开发者平台](https://open-dev.dingtalk.com/)
2. 创建企业内部应用
3. 获取 **AppKey** 和 **AppSecret**
4. 先暂时配置回调地址为：`http://localhost:8000`

### 3. 生成 JWT 密钥

```bash
deno eval "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

---

## 🧪 本地测试

### 1. 创建 `.env` 文件

```bash
cp .env.example .env
```

编辑 `.env`：

```env
OPENROUTER_API_KEY=sk-or-v1-你的密钥
DINGTALK_APP_KEY=你的钉钉AppKey
DINGTALK_APP_SECRET=你的钉钉AppSecret
DINGTALK_REDIRECT_URI=http://localhost:8000/auth/callback
JWT_SECRET=刚才生成的随机密钥
VITE_DEV_MODE_SKIP_AUTH=true
```

### 2. 构建前端

```bash
npm install
npm run build
```

这会生成 `dist/` 目录。

### 3. 启动 Deno 服务器

```bash
deno task dev
```

或者：

```bash
deno run --allow-net --allow-read --allow-env --watch server.ts
```

### 4. 访问应用

打开浏览器访问 `http://localhost:8000`

---

## 🚀 部署到 Deno Deploy（推荐）

### 方法 1：通过 GitHub 自动部署（推荐）

#### 步骤 1：推送代码到 GitHub

```bash
git add .
git commit -m "准备部署到 Deno Deploy"
git push
```

#### 步骤 2：连接 Deno Deploy

1. 访问 https://dash.deno.com/new
2. 点击 **"Deploy from GitHub"**
3. 授权 Deno Deploy 访问你的 GitHub
4. 选择你的仓库
5. 配置项目：
   - **Entry Point**: `server.ts`
   - **Install Step**: `npm install && npm run build`

#### 步骤 3：配置环境变量

在 Deno Deploy 项目设置中，添加环境变量：

```
OPENROUTER_API_KEY=sk-or-v1-你的密钥
DINGTALK_APP_KEY=你的钉钉AppKey
DINGTALK_APP_SECRET=你的钉钉AppSecret
DINGTALK_REDIRECT_URI=https://你的项目.deno.dev/auth/callback
JWT_SECRET=随机密钥
VITE_DEV_MODE_SKIP_AUTH=false
```

⚠️ **注意**：`DINGTALK_REDIRECT_URI` 中的域名要等部署完成后才知道。

#### 步骤 4：部署并更新回调地址

1. 点击 **"Deploy"**
2. 部署完成后，Deno Deploy 会给你一个域名，例如：`https://your-project.deno.dev`
3. 回到环境变量，更新 `DINGTALK_REDIRECT_URI`
4. 重新部署（推送新的 commit 或手动触发）
5. 回到钉钉开发者平台，添加回调域名

---

### 方法 2：使用 deployctl CLI

#### 步骤 1：安装 deployctl

```bash
deno install -A --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

#### 步骤 2：登录

```bash
deployctl login
```

#### 步骤 3：部署

```bash
# 构建前端
npm run build

# 部署
deployctl deploy --project=你的项目名 server.ts
```

---

## 🔧 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API 密钥 |
| `DINGTALK_APP_KEY` | ✅ | 钉钉应用 AppKey |
| `DINGTALK_APP_SECRET` | ✅ | 钉钉应用 AppSecret |
| `DINGTALK_REDIRECT_URI` | ✅ | 钉钉回调地址 |
| `JWT_SECRET` | ✅ | JWT 签名密钥 |
| `VITE_DEV_MODE_SKIP_AUTH` | ❌ | 开发模式（生产环境必须为 false） |
| `PORT` | ❌ | 服务器端口（默认 8000） |

---

## 🎯 优势

### Deno Deploy vs Vercel

| 特性 | Deno Deploy | Vercel |
|------|-------------|--------|
| 部署速度 | ⚡ 超快（秒级） | 🐢 较慢（分钟级） |
| 免费额度 | 🎁 100万请求/月 | 🎁 100GB带宽/月 |
| 边缘计算 | ✅ 全球35+节点 | ✅ 全球节点 |
| TypeScript | ✅ 原生支持 | ⚠️ 需要编译 |
| 配置复杂度 | 😊 简单 | 😐 中等 |

---

## 🐛 常见问题

### Q1: 本地测试时提示"Permission denied"

**解决方法**：
```bash
deno run --allow-net --allow-read --allow-env server.ts
```

### Q2: 部署后提示"Module not found"

**解决方法**：
1. 确保 `npm run build` 已执行
2. 确保 `dist/` 目录已提交到 Git
3. 检查 Deno Deploy 的 Install Step 配置

### Q3: 静态文件 404

**解决方法**：
1. 检查 `dist/` 目录是否存在
2. 确保前端已构建：`npm run build`
3. 检查 `server.ts` 中的 `fsRoot: "./dist"`

---

## 📝 项目结构

```
.
├── server.ts              # Deno 主服务器
├── deno.json              # Deno 配置
├── deno-api/              # Deno API 处理器
│   ├── analyze.ts
│   ├── generate.ts
│   └── auth/
│       ├── dingtalk-login.ts
│       ├── dingtalk-callback.ts
│       ├── user-info.ts
│       └── logout.ts
├── dist/                  # Vite 构建产物（前端）
├── src/                   # 前端源码
└── package.json           # npm 依赖（仅用于前端构建）
```

---

## 🎊 完成！

现在你的应用已经部署到 Deno Deploy，享受超快的边缘计算吧！

需要帮助？查看 [Deno Deploy 文档](https://deno.com/deploy/docs)

