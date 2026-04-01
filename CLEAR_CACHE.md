# 清除浏览器缓存 - Clear Browser Cache

## 问题

如果您遇到以下错误：
- `GET /api/tasks 401 (Unauthorized)`
- Service Worker错误：`Failed to execute 'put' on 'Cache'`

## 解决方案

### 方法1: 强制刷新（推荐）

1. 打开浏览器
2. 按 `Ctrl + F5`（Windows/Linux）或 `Cmd + Shift + R`（Mac）
3. 这将强制重新加载所有资源，绕过缓存

### 方法2: 清除应用缓存

1. 打开浏览器开发者工具（按 `F12`）
2. 进入 `Application` 或 `应用程序` 标签
3. 左侧菜单：
   - **Chrome/Edge**: `Storage` → `Clear site data`
   - **Firefox**: `Storage` → `Clear All`
   - **Safari**: `Storage` → 点击每个缓存项，点击删除
4. 点击 `Clear site data` 或 `清除网站数据`

### 方法3: 手动清除Service Worker

1. 打开浏览器开发者工具（按 `F12`）
2. 进入 `Application` 或 `应用程序` 标签
3. 左侧菜单找到 `Service Workers`
4. 点击 `Unregister` 或 `注销` 按钮
5. 刷新页面

### 方法4: 清除localStorage和SessionStorage

在浏览器控制台（Console）中执行：

```javascript
// 清除localStorage
localStorage.clear();

// 清除sessionStorage
sessionStorage.clear();

// 刷新页面
location.reload();
```

### 方法5: 无痕模式测试

1. 打开无痕/隐私浏览窗口：
   - Chrome/Edge: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Safari: `Cmd + Shift + N`
2. 访问 `http://localhost:3001`
3. 测试功能

## 验证修复

清除缓存后，打开浏览器控制台，您应该看到：

```
Initializing application...
initAuth: token loaded: yes
initAuth: user loaded: {id: "...", email: "...", name: "..."}
addAuthHeader called, token: exists
Application initialized successfully
```

如果看到 `token loaded: no`，说明localStorage中的token丢失了，需要重新登录。

## 调试步骤

如果问题仍然存在：

1. 打开浏览器控制台（按 `F12`）
2. 查看 `Console` 标签
3. 查找以下信息：
   - `initAuth: token loaded:` 后面是 yes 还是 no
   - `addAuthHeader called, token:` 后面是 exists 还是 missing
   - 任何红色的错误信息

4. 检查 `Network` 标签：
   - 刷新页面
   - 查看 `/api/tasks` 请求
   - 检查 `Request Headers` 中是否有 `Authorization: Bearer ...`
   - 检查 `Response Status Code` 是否为 200

## 常见问题

### Q: 为什么需要清除缓存？

A: 浏览器可能缓存了旧版本的JavaScript文件，即使服务器已经更新。Service Worker也会缓存API响应。

### Q: 清除缓存会丢失我的数据吗？

A: 不会。数据存储在服务器的数据库中。清除缓存只会删除浏览器中的临时文件。

### Q: 每次更新都需要清除缓存吗？

A: 不需要。通常只需要在首次更新或遇到问题时清除一次。

### Q: 如何防止缓存问题？

A: 我们正在改进前端代码，添加版本控制和缓存失效机制。
