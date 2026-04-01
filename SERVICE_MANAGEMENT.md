# 服务管理指南 - Service Management Guide

## 🌐 服务架构

TaskManager v2.1 需要同时运行两个服务：

| 服务 | 端口 | 用途 | 命令 |
|------|------|------|------|
| 后端API | 3000 | RESTful API + OAuth | `cd src/backend && npm start` |
| 前端页面 | 3001 | 静态文件服务 | `cd src/frontend && npm start` |

---

## 🚀 启动服务

### 方法1: 手动启动（推荐用于开发）

**启动后端服务**：
```bash
cd F:\bigsinger\TaskManager\src\backend
npm start
```

**启动前端服务**（新终端窗口）：
```bash
cd F:\bigsinger\TaskManager\src\frontend
npm start
```

### 方法2: 同时启动（使用start-all脚本）

如果已创建启动脚本：
```bash
cd F:\bigsinger\TaskManager
npm run start:all
```

### 方法3: 使用PowerShell（Windows）

```powershell
# 启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd F:\bigsinger\TaskManager\src\backend; npm start"

# 启动前端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd F:\bigsinger\TaskManager\src\frontend; npm start"
```

---

## 🛑 停止服务

### 方法1: Ctrl + C

在每个终端窗口中按 `Ctrl + C` 停止对应的服务。

### 方法2: 使用taskkill（强制停止）

```bash
# 停止后端（3000端口）
netstat -ano | findstr ":3000"
taskkill /F /PID <进程ID>

# 停止前端（3001端口）
netstat -ano | findstr ":3001"
taskkill /F /PID <进程ID>
```

### 方法3: 批量停止

```bash
# 查找并停止所有node进程
tasklist | findstr node.exe
taskkill /F /IM node.exe
```

---

## 🔍 检查服务状态

### 检查端口占用

```bash
# 检查后端
netstat -ano | findstr ":3000"

# 检查前端
netstat -ano | findstr ":3001"
```

### 检查服务日志

**后端日志**（在后端终端查看）：
```
Server is running on http://localhost:3000
API endpoint: http://localhost:3000/api/tasks
✓ GitHub OAuth strategy initialized
```

**前端日志**（在前端终端查看）：
```
Available on:
  http://10.242.10.28:3001
  http://127.0.0.1:3001
Hit CTRL-C to stop the server
```

---

## 🌐 访问应用

### 本地访问

- **前端页面**: http://localhost:3001
- **后端API**: http://localhost:3000
- **登录页面**: http://localhost:3001/login.html

### 局域网访问

- **前端页面**: http://10.242.10.28:3001（示例IP）
- **后端API**: http://10.242.10.28:3000

---

## 🐛 常见问题

### 问题1: 端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
```bash
# 查找占用端口的进程
netstat -ano | findstr ":3000"

# 杀死进程
taskkill /F /PID <进程ID>

# 重新启动服务
cd F:\bigsinger\TaskManager\src\backend
npm start
```

### 问题2: 前端页面无法访问

**症状**：
- 访问 http://localhost:3001 显示"无法访问此网站"
- 或者 ERR_CONNECTION_REFUSED

**解决方案**：
```bash
# 检查前端服务是否运行
netstat -ano | findstr ":3001"

# 如果没有运行，启动前端服务
cd F:\bigsinger\TaskManager\src\frontend
npm start
```

### 问题3: 后端API无法访问

**症状**：
- 创建任务时显示500错误
- 加载任务失败

**解决方案**：
```bash
# 检查后端服务是否运行
netstat -ano | findstr ":3000"

# 如果没有运行，启动后端服务
cd F:\bigsinger\TaskManager\src\backend
npm start
```

### 问题4: 服务启动后立即退出

**检查日志**：
- 查看终端窗口是否有错误信息
- 检查 `.env` 文件是否存在
- 检查数据库文件是否被锁定

**解决方案**：
```bash
# 删除数据库锁文件
cd F:\bigsinger\TaskManager\src\backend
del tasks.db-shm
del tasks.db-wal

# 重新启动
npm start
```

---

## 📝 服务启动检查清单

- [ ] 后端服务已启动（3000端口）
- [ ] 前端服务已启动（3001端口）
- [ ] 后端终端显示"Server is running on http://localhost:3000"
- [ ] 前端终端显示"Available on: http://127.0.0.1:3001"
- [ ] 浏览器可以访问 http://localhost:3001
- [ ] 浏览器可以访问 http://localhost:3001/login.html
- [ ] 后端API响应正常（访问 http://localhost:3000/api/health）

---

## 🔧 开发环境配置

### 必需的依赖

**后端**：
```bash
cd src/backend
npm install
```

**前端**：
```bash
cd src/frontend
npm install
```

### 环境变量

确保 `src/backend/.env` 文件存在且包含：
```env
PORT=3000
DATABASE_URL=file:./tasks.db
JWT_SECRET=your-secret-key-change-in-production
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
APP_URL=http://localhost:3001
```

---

## 💡 最佳实践

### 1. 使用独立的终端窗口

- 后端和前端分别在不同的终端窗口运行
- 便于查看各自的日志
- 便于独立停止和重启

### 2. 保持服务运行

- 开发期间保持两个服务都运行
- 修改前端代码后，浏览器会自动刷新（如果启用了热重载）
- 修改后端代码后，需要重启后端服务

### 3. 定期检查日志

- 前端问题：查看浏览器控制台（F12）
- 后端问题：查看后端终端窗口
- OAuth问题：查看后端日志中的OAuth相关信息

### 4. 备份数据库

```bash
# 备份数据库
cd F:\bigsinger\TaskManager\src\backend
copy tasks.db tasks.db.backup

# 恢复数据库
copy tasks.db.backup tasks.db
```

---

## 📞 需要帮助？

如果遇到其他问题：

1. 检查服务状态（`netstat -ano | findstr ":300"`)
2. 查看服务日志
3. 检查浏览器控制台（F12 → Console）
4. 参考 [清除浏览器缓存指南](./CLEAR_CACHE.md)
5. 参考 [OAuth错误修复指南](./FIX_OAUTH_ERROR.md)
