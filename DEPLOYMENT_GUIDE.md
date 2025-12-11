# 部署指南

## 📦 本地部署步骤

### 1️⃣ 安装 Node.js

#### Windows 用户

**方法一：官网下载（推荐）**

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 **LTS 版本**（长期支持版）
3. 运行安装程序，保持默认选项
4. 验证安装：
   ```bash
   node -v
   npm -v
   ```

**方法二：使用包管理器**

```bash
# 使用 Chocolatey
choco install nodejs-lts

# 或使用 Scoop
scoop install nodejs-lts
```

### 2️⃣ 克隆或下载项目

```bash
cd e:\demo
# 如果已经有项目文件夹，直接进入
cd 珠宝爆款产品开发无限生成器2.0
```

### 3️⃣ 安装依赖

```bash
npm install
```

这会安装所有必需的依赖包，包括：
- React
- Vite
- OpenAI SDK
- 其他工具库

### 4️⃣ 配置 API Key

编辑 `.env.local` 文件：

```env
# OpenRouter API 配置
OPENROUTER_API_KEY=你的OpenRouter_API密钥

# 可选：站点信息
SITE_URL=https://localhost:3000
SITE_NAME=珠宝设计生成器
```

**如何获取 OpenRouter API Key？**
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册并登录
3. 前往 [API Keys 页面](https://openrouter.ai/keys)
4. 创建新的 API Key
5. 复制并粘贴到 `.env.local`

### 5️⃣ 启动开发服务器

```bash
npm run dev
```

项目会在 `http://localhost:3000` 启动。

### 6️⃣ 访问应用

打开浏览器访问：`http://localhost:3000`

## 🚀 生产部署

### 构建生产版本

```bash
npm run build
```

构建产物会生成在 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## ⚠️ 常见问题

### 问题 1：命令找不到

如果安装 Node.js 后提示 `node` 或 `npm` 命令找不到：
- 关闭并重新打开终端
- 或者重启电脑

### 问题 2：npm install 很慢

使用国内镜像加速：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题 3：权限错误

以**管理员身份**运行 PowerShell：
- 右键点击 PowerShell 图标
- 选择 "以管理员身份运行"

### 问题 4：端口被占用

如果 3000 端口被占用，可以修改 `vite.config.ts`：
```typescript
server: {
  port: 3001, // 改为其他端口
  host: '0.0.0.0',
},
```

## 📋 快速检查清单

- [ ] 安装 Node.js（v18 或更高版本）
- [ ] 验证 `node -v` 和 `npm -v` 有输出
- [ ] 在项目目录运行 `npm install`
- [ ] 配置 `.env.local` 中的 `OPENROUTER_API_KEY`
- [ ] 运行 `npm run dev`
- [ ] 浏览器访问 `http://localhost:3000`

## 🔧 其他命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📚 相关文档

- [OpenRouter 配置指南](./OPENROUTER_CONFIG.md)
- [Node.js 官方文档](https://nodejs.org/docs/)
- [Vite 文档](https://vitejs.dev/)

