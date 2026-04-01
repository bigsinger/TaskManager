# OAuth 第三方登录配置指南

本文档详细说明如何配置 GitHub 和 Google OAuth 登录功能。

---

## 📋 目录

- [GitHub OAuth 配置](#github-oauth-配置)
- [Google OAuth 配置](#google-oauth-配置)
- [配置完成后的步骤](#配置完成后的步骤)

---

## GitHub OAuth 配置

### 步骤 1: 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **"New OAuth App"** 按钮
3. 填写应用信息：
   - **Application name**: TaskManager (或您喜欢的名称)
   - **Homepage URL**: `http://localhost:3001`
   - **Application description**: Task Manager with OAuth
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. 点击 **"Register application"**

### 步骤 2: 获取凭证

注册成功后，您会看到：
- **Client ID**: 复制这个值
- **Client Secret**: 点击 **"Generate a new client secret"** 获取密钥

### 步骤 3: 更新 .env 文件

打开 `src/backend/.env` 文件，取消注释并填入：

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

**注意事项**:
- `your-github-client-id` 替换为实际的 Client ID
- `your-github-client-secret` 替换为实际的 Client Secret
- Callback URL 必须与 GitHub 中配置的完全一致

### 步骤 4: 重启后端服务

```bash
# 停止当前服务 (Ctrl+C)
# 重新启动
npm start
```

成功启动后，您应该看到：
```
✓ GitHub OAuth strategy initialized
```

---

## Google OAuth 配置

### 步骤 1: 创建 Google Cloud Project

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 在左侧菜单选择 **APIs & Services** → **Credentials**

### 步骤 2: 配置 OAuth 同意屏幕

1. 点击 **"OAuth consent screen"** 标签页
2. 选择 **External** 用户类型
3. 填写必要信息：
   - **App name**: TaskManager
   - **User support email**: 您的邮箱
   - **Developer contact email**: 您的邮箱
4. 点击 **"SAVE AND CONTINUE"**
5. Scopes 步骤可以跳过（点击 SAVE AND CONTINUE）
6. Test users 步骤可以跳过（点击 SAVE AND CONTINUE）

### 步骤 3: 创建 OAuth 2.0 客户端 ID

1. 在 **Credentials** 页面，点击 **"Create Credentials"**
2. 选择 **OAuth client ID**
3. 应用类型选择 **Web application**
4. 填写信息：
   - **Name**: TaskManager Web Client
   - **Authorized JavaScript origins**: `http://localhost:3001`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/google/callback`
5. 点击 **"Create"**

### 步骤 4: 获取凭证

创建成功后，您会看到：
- **Client ID**: 复制这个值
- **Client Secret**: 点击 **"COPY"** 获取密钥

### 步骤 5: 更新 .env 文件

打开 `src/backend/.env` 文件，取消注释并填入：

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**注意事项**:
- `your-google-client-id` 替换为实际的 Client ID
- `your-google-client-secret` 替换为实际的 Client Secret
- Callback URL 必须与 Google 中配置的完全一致

### 步骤 6: 启用 People API

1. 在 Google Cloud Console，选择 **APIs & Services** → **Library**
2. 搜索 **"People API"**
3. 点击 **"Enable"** 按钮

### 步骤 7: 重启后端服务

```bash
# 停止当前服务 (Ctrl+C)
# 重新启动
npm start
```

成功启动后，您应该看到：
```
✓ Google OAuth strategy initialized
```

---

## 配置完成后的步骤

### 1. 验证配置

检查后端日志，应该看到：
```
✓ GitHub OAuth strategy initialized
✓ Google OAuth strategy initialized
Server is running on http://localhost:3000
```

### 2. 测试 OAuth 登录

1. 访问 http://localhost:3001/login
2. 点击 **GitHub** 或 **Google** 登录按钮
3. 应该跳转到对应平台的授权页面
4. 授权后应该自动登录并跳转到任务管理页面

### 3. 检查可用提供商

访问 http://localhost:3000/api/auth/providers 查看当前启用的OAuth提供商：

```json
{
  "providers": ["github", "google"],
  "github": {
    "enabled": true,
    "url": "/api/auth/github"
  },
  "google": {
    "enabled": true,
    "url": "/api/auth/google"
  }
}
```

---

## 🔧 生产环境配置

生产环境部署时，需要修改以下 URL：

### .env 文件

```env
# 开发环境
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# 生产环境（替换为您的域名）
GITHUB_CALLBACK_URL=https://your-domain.com/api/auth/github/callback
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

APP_URL=https://your-domain.com
```

### GitHub OAuth App 配置

更新 Callback URL：
- **开发环境**: `http://localhost:3000/api/auth/github/callback`
- **生产环境**: `https://your-domain.com/api/auth/github/callback`

### Google OAuth Client 配置

更新以下设置：
- **Authorized JavaScript origins**: 
  - 开发: `http://localhost:3001`
  - 生产: `https://your-domain.com`
  
- **Authorized redirect URIs**:
  - 开发: `http://localhost:3000/api/auth/google/callback`
  - 生产: `https://your-domain.com/api/auth/google/callback`

---

## ❓ 常见问题

### Q: 为什么 OAuth 按钮点击后返回 503 错误？

A: 这表示 OAuth 未配置。请检查：
1. `.env` 文件是否存在
2. 是否填入了正确的 Client ID 和 Secret
3. 是否重启了后端服务

### Q: GitHub OAuth 返回 "redirect_uri_mismatch" 错误

A: Callback URL 不匹配。请检查：
1. GitHub OAuth App 中的 Callback URL
2. `.env` 文件中的 `GITHUB_CALLBACK_URL`
3. 两者必须完全一致（包括协议、域名、端口）

### Q: Google OAuth 返回 "redirect_uri_mismatch" 错误

A: Callback URL 不匹配。请检查：
1. Google OAuth Client 中的 Authorized redirect URIs
2. `.env` 文件中的 `GOOGLE_CALLBACK_URL`
3. 两者必须完全一致（包括协议、域名、端口）

### Q: OAuth 登录后没有创建用户？

A: 这是正常的。OAuth 用户会：
- 首次登录时自动创建新用户
- 使用 `default` 租户（或根据邮箱关联已有租户）
- 自动分配 `role-executor` 角色

### Q: 如何禁用某个 OAuth 提供商？

A: 在 `.env` 文件中注释掉对应的配置即可：

```env
# 禁用 GitHub OAuth
# GITHUB_CLIENT_ID=xxx
# GITHUB_CLIENT_SECRET=xxx

# 保留 Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## 📞 获取帮助

如果在配置过程中遇到问题：

1. 检查后端日志查看详细错误信息
2. 访问 OAuth 提供商的文档
3. 确认 Callback URL 配置正确
4. 确保 `.env` 文件格式正确

---

**配置完成后，您的用户就可以使用 GitHub 和 Google 账号一键登录了！**
