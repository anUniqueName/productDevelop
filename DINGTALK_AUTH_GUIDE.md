# 钉钉 OAuth 2.0 登录集成指南

## 📋 目录

1. [功能概述](#功能概述)
2. [钉钉应用配置](#钉钉应用配置)
3. [本地开发测试](#本地开发测试)
4. [架构说明](#架构说明)
5. [安全性说明](#安全性说明)

**部署到 Vercel 请查看：[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 功能概述

现在你的应用已经集成了**钉钉 OAuth 2.0 登录认证**，用户必须通过钉钉账号登录才能访问应用。

### ✅ 已实现的功能

- ✅ 钉钉 OAuth 2.0 登录流程
- ✅ JWT Token 认证（httpOnly Cookie）
- ✅ 用户信息获取和显示
- ✅ 登出功能
- ✅ 路由保护（未登录自动跳转登录页）
- ✅ CSRF 防护（state 参数验证）
- ✅ 安全的 Token 存储（httpOnly Cookie）

---

## 钉钉应用配置

### 1. 创建钉钉应用

1. 访问 [钉钉开发者平台](https://open-dev.dingtalk.com/)
2. 登录你的钉钉账号
3. 进入"应用开发" > "企业内部开发" > "创建应用"
4. 填写应用信息：
   - **应用名称**：无限开发配置器（或你的应用名称）
   - **应用描述**：产品设计生成器
   - **应用图标**：上传你的应用图标

### 2. 配置应用权限

在应用详情页，配置以下权限：

- ✅ **通讯录只读权限**（`Contact.User.Read`）
- ✅ **个人信息读权限**（`Contact.User.mobile`）

### 3. 配置回调地址

在"开发配置" > "登录与分享" > "回调域名"中添加：

**本地开发**：
```
http://localhost:3000
```

**生产环境**（Vercel）：
```
https://your-app-name.vercel.app
```

### 4. 获取凭证

在应用详情页，复制以下信息：

- **AppKey**（ClientId）
- **AppSecret**（ClientSecret）



## 本地开发测试

### 开发模式（跳过登录）

在 `.env.local` 中设置：

```env
VITE_DEV_MODE_SKIP_AUTH=true
OPENROUTER_API_KEY=你的密钥
```

启动服务器：

```bash
npm run dev
```

访问 `http://localhost:3000`，会自动以测试用户身份登录。

### 测试真实钉钉登录

⚠️ **注意**：本地测试钉钉登录需要使用 Vercel CLI，因为 Vite 不支持 API 路由。

**推荐直接部署到 Vercel 测试**，参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 架构说明

### 文件结构

```
├── api/
│   └── auth/
│       ├── dingtalk-login.ts      # 生成钉钉登录 URL
│       ├── dingtalk-callback.ts   # 处理钉钉回调
│       ├── user-info.ts           # 获取当前用户信息
│       └── logout.ts              # 登出
├── components/
│   ├── DingTalkLogin.tsx          # 钉钉登录按钮
│   ├── DingTalkCallback.tsx       # 回调处理页面
│   └── UserProfile.tsx            # 用户信息显示
├── contexts/
│   └── AuthContext.tsx            # 认证状态管理
├── services/
│   └── authService.ts             # 认证 API 调用
└── AppWithAuth.tsx                # 带认证的应用入口
```

### 认证流程

```
1. 用户访问应用
   ↓
2. 检查是否已登录（JWT Cookie）
   ↓
3. 未登录 → 显示登录页面
   ↓
4. 点击"使用钉钉登录"
   ↓
5. 跳转到钉钉授权页面
   ↓
6. 用户授权后，钉钉回调到 /auth/callback?code=xxx
   ↓
7. 后端使用 code 交换 accessToken
   ↓
8. 使用 accessToken 获取用户信息
   ↓
9. 生成 JWT Token，设置 httpOnly Cookie
   ↓
10. 前端更新认证状态，跳转到主应用
```

---

## 安全性说明

### ✅ 已实现的安全措施

1. **httpOnly Cookie**
   - JWT Token 存储在 httpOnly Cookie 中
   - JavaScript 无法访问，防止 XSS 攻击

2. **CSRF 防护**
   - 使用 state 参数验证回调请求
   - 防止跨站请求伪造攻击

3. **API Secret 保护**
   - `DINGTALK_APP_SECRET` 只在后端使用
   - 前端代码中不包含任何敏感信息

4. **JWT 签名验证**
   - 所有 API 请求都验证 JWT 签名
   - 防止 Token 伪造

5. **环境变量隔离**
   - 开发和生产环境使用不同的密钥
   - `.env.local` 已加入 `.gitignore`



