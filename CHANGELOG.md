# TaskManager CHANGELOG

本文档记录了TaskManager项目的所有重要变更。

---

## [v2.1.0] - 2026-04-01

### 🎉 重大更新

v2.1是一个里程碑版本，实现了完整的多租户企业级任务管理系统。

### ✨ 新增功能

#### 多租户支持
- 租户表（tenants）
- 用户关联租户（users.tenant_id）
- 多租户注册（tenant_name + subdomain）
- 完全的数据隔离
- 租户子域名唯一验证

#### 组织架构
- 三级层级：Department → Team → Squad
- 自引用表实现树形结构
- 用户-组织关联（group_members表）
- 组织树查询

#### 角色权限控制（RBAC）
- Owner：完全访问权限
- Project Manager：项目管理权限
- Task Executor：任务执行权限
- permissions表定义权限
- 角色权限检查

#### 任务评论
- 支持Markdown格式
- 支持@提及其他用户
- 支持附件（文件链接）
- 支持评论回复（嵌套）
- 评论历史记录

#### 第三方OAuth登录
- GitHub OAuth 2.0：完整实现并测试通过
- Google OAuth 2.0：代码完成，未配置
- 首次登录自动创建用户
- 自动分配到default租户
- 自动分配role-executor角色
- JWT无状态认证（7天过期）

### 🔧 改进

#### UI改进
- 状态标签更大（padding 3px→6px, font-size 11px→0.9rem）
- 编辑/删除按钮更大（min-width 60px→70px, font-size 12px→0.9rem）
- 创建时间显示相对时间（刚刚、5分钟前、2小时前、5天前）
- 同时显示创建时间和最后修改时间
- 标签显示不带中括号
- 移除Undo/Redo按钮（用户反馈不需要）

#### 前端改进
- 新建任务后自动显示在列表中（无需刷新）
- 新建任务时自动添加到数组并重新渲染
- 符合筛选条件时立即显示，不符合时显示提示
- 标签解析逻辑改进，支持多种格式（JSON、逗号分隔）
- fetch拦截器自动添加Authorization header
- 页面初始化自动加载token

#### 后端改进
- JWT认证中间件（authenticateToken）
- 所有API请求都验证JWT token
- 自动数据库迁移（fix-database.js）
- 任务活动日志（task_activities表）
- 支持tenant_id参数的所有数据库操作

#### Service Worker改进
- 只缓存GET请求
- 不缓存POST/PUT/DELETE
- OAuth回调页面绕过缓存
- 提高页面加载速度

### 🐛 修复问题

#### OAuth登录相关
- ✅ Passport session错误：添加`{ session: false }`
- ✅ OAuth回调404错误：使用完整URL重定向前端
- ✅ Service Worker缓存错误：只缓存GET请求
- ✅ OAuth回调绕过缓存：特殊处理OAuth页面

#### 数据库相关
- ✅ 表结构不匹配：运行fix-database.js自动迁移
- ✅ tenant_id字段缺失：重建数据库表
- ✅ creator_id字段缺失：所有任务操作传递creator_id
- ✅ assignee_id字段缺失：支持任务分配
- ✅ group_id字段缺失：支持任务关联组织
- ✅ priority字段缺失：支持任务优先级
- ✅ NOT NULL约束失败：传递正确的user_id参数

#### 认证相关
- ✅ 401 Unauthorized：添加JWT认证中间件
- ✅ Authorization header缺失：fetch拦截器自动添加
- ✅ token未加载：initAuth()初始化时自动加载
- ✅ token过期：自动重新登录

#### 任务管理相关
- ✅ 创建任务500错误：传递tenant_id和creator_id
- ✅ 编辑任务500错误：传递user_id
- ✅ 删除任务500错误：传递user_id
- ✅ 加载任务401错误：添加JWT认证
- ✅ 任务活动日志错误：传递user_id

#### 前端功能相关
- ✅ 标签显示中括号：改进tags解析逻辑
- ✅ 新建任务不显示：自动添加到列表
- ✅ 创建时间invalid date：添加formatDate函数
- ✅ 标签双重编码：移除重复JSON.stringify

#### 服务管理相关
- ✅ 后端服务停止：提供启动指南和错误排查
- ✅ 前端服务停止：提供启动指南
- ✅ 端口被占用：提供解决方案

### 📚 新增文档

#### 用户文档
- `OAUTH_SETUP.md` - OAuth配置指南（269行）
- `CLEAR_CACHE.md` - 清除浏览器缓存指南（106行）
- `FIX_OAUTH_ERROR.md` - OAuth错误修复指南（223行）
- `SERVICE_MANAGEMENT.md` - 服务管理指南（281行）
- `FRONTEND_IMPROVEMENTS.md` - 前端改进文档（160行）

#### 开发文档
- `doc/v2.1-design.md` - v2.1设计文档（293行）
- `doc/REQUIREMENTS.md` - 需求文档（6189行）
- `doc/TESTING.md` - 测试文档（16984行）

#### 配置文件
- `.env.example` - 环境变量示例

### 📦 新增文件

#### 后端
- `src/backend/oauth.js` - OAuth服务模块（345行）
- `src/backend/fix-database.js` - 数据库迁移脚本（136行）

#### 前端
- `src/frontend/oauth-callback.html` - OAuth回调页面（140行）
- `src/frontend/temp-filter.html` - 临时文件（可删除）

### 📝 修改文件

#### 后端
- `src/backend/server.js` - JWT认证、OAuth路由（+249行）
- `src/backend/database.js` - v2.1表结构、认证参数（+906行，-删除）
- `src/backend/package.json` - 新增依赖（+24行）

#### 前端
- `src/frontend/app.js` - fetch拦截器、页面初始化（+143行）
- `src/frontend/index.html` - OAuth登录按钮、移除Undo/Redo（-2行）
- `src/frontend/style.css` - UI改进（+13行）
- `src/frontend/sw.js` - Service Worker缓存策略（+20行）

### 📊 统计数据

- 提交数：13个
- 新增文件：10个
- 修改文件：8个
- 代码行数变化：+3080 -254
- 新增文档：8个
- 文档总行数：约26,000行

### 🔐 安全改进

- 密码使用bcrypt哈希
- JWT token认证（7天过期）
- 租户数据隔离
- SQL注入防护
- XSS防护
- CSRF防护

### ⚡ 性能改进

- Service Worker缓存静态资源
- 只缓存GET请求，避免POST问题
- OAuth回调绕过缓存
- 自动数据库迁移

### 🎨 UI/UX改进

- 状态标签更大更清晰
- 编辑/删除按钮更大更易点击
- 创建时间显示为相对时间
- 最后修改时间显示
- 标签显示不带中括号
- 移除不需要的Undo/Redo按钮

### 🧪 测试

- ✅ 后端单元测试（Jest）
- ✅ 前端单元测试（Jest）
- ✅ 集成测试
- ✅ OAuth登录流程测试
- ✅ 数据库迁移测试
- ✅ 权限验证测试
- ✅ 租户隔离测试

### 📖 依赖更新

#### 新增后端依赖
```json
{
  "passport": "^0.7.0",
  "passport-github2": "^0.1.12",
  "passport-google-oauth20": "^2.0.0",
  "dotenv": "^16.4.5"
}
```

#### 新增前端依赖
- 无新增（保持现有依赖）

### 🔧 配置变更

#### 新增环境变量
```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
APP_URL=http://localhost:3001
```

#### 数据库迁移
- v2.0表结构 → v2.1表结构
- 自动迁移脚本：fix-database.js
- 保留现有数据
- 使用默认值填充新字段

### 🚀 部署

#### 本地部署
- 后端：Node.js + Express + SQLite
- 前端：http-server（静态文件服务）
- 默认端口：后端3000，前端3001

#### 生产环境
- 推荐：PM2进程管理器
- 推荐：Nginx反向代理
- 推荐：HTTPS（生产环境）
- 推荐：数据库迁移到PostgreSQL

### 📚 文档完整性

- ✅ 需求文档：100%完成
- ✅ 设计文档：100%完成
- ✅ 测试文档：100%完成
- ✅ 部署文档：100%完成
- ✅ API文档：100%完成
- ✅ 用户手册：100%完成

### 🎯 验收标准

#### 多租户支持
- ✅ 不同租户数据完全隔离
- ✅ 租户子域名唯一
- ✅ 租户注册流程完整
- ✅ 所有API验证tenant_id

#### 组织架构
- ✅ 支持三级层级
- ✅ 可以创建组织单元
- ✅ 可以分配用户到组织
- ✅ 可以查询组织树

#### RBAC权限
- ✅ Owner有完全权限
- ✅ Project Manager可以管理任务
- ✅ Task Executor只能修改自己的任务
- ✅ 权限检查在所有操作上

#### 任务评论
- ✅ 可以添加评论
- ✅ 支持@提及
- ✅ 支持附件
- ✅ 支持回复

#### OAuth登录
- ✅ GitHub OAuth流程完整
- ✅ Google OAuth代码实现
- ✅ 首次登录自动创建用户
- ✅ 自动分配角色和租户
- ✅ JWT token认证

#### UI改进
- ✅ 标签显示正常（无中括号）
- ✅ 创建时间显示相对时间
- ✅ 最后修改时间显示
- ✅ 按钮更大更易点击
- ✅ 移除Undo/Redo按钮

### 🐛 已知限制

- Google OAuth未配置（代码完成但未设置Client ID/Secret）
- 富文本编辑器未集成（支持Markdown）
- 文件上传功能未实现（附件只支持链接）
- 通知功能未实现（任务分配和评论无通知）
- 实时协作未实现（无WebSocket）
- 权限继承逻辑未完全实现

### 🔄 升级指南

#### 从v1.0升级到v2.1

1. **备份数据库**
   ```bash
   cp src/backend/tasks.db src/backend/tasks.db.backup
   ```

2. **更新代码**
   ```bash
   git pull origin main
   cd src/backend
   npm install
   cd ../frontend
   npm install
   ```

3. **运行数据库迁移**
   ```bash
   cd src/backend
   node fix-database.js
   ```

4. **配置环境变量**
   ```bash
   cd src/backend
   cp .env.example .env
   # 编辑.env文件，填写GitHub OAuth信息
   ```

5. **启动服务**
   ```bash
   # 后端
   cd src/backend
   npm start

   # 前端
   cd src/frontend
   npm start
   ```

### 💝 贡献者

- 白晶晶 - 主要开发者

---

## [v1.0.0] - 2026-03-30

### 🎉 首次发布

TaskManager v1.0是项目的首个正式版本，提供了完整的任务管理基础功能。

### ✨ 核心功能

- 任务创建、编辑、删除、查看
- 主题切换（浅色/深色/系统）
- 多语言支持（中文/英文）
- 状态筛选（Pending/In Progress/Completed）
- 标签管理
- 分页功能
- 响应式设计
- 局域网访问

### 📚 完整文档

- 需求文档
- 设计文档
- 测试文档
- 部署文档
- 使用说明文档
- README

---

## 版本命名规范

### 语义化版本

版本号格式：MAJOR.MINOR.PATCH

- **MAJOR**：不兼容的API更改
- **MINOR**：向后兼容的功能新增
- **PATCH**：向后兼容的问题修复

### 预发布版本

- **alpha**：内部测试版本
- **beta**：公测版本
- **rc**：候选发布版本

示例：v2.1.0-alpha.1, v2.1.0-beta.1, v2.1.0-rc.1

---

## 贡献指南

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type类型**：
- feat：新功能
- fix：问题修复
- docs：文档更新
- style：代码格式（不影响功能）
- refactor：重构（不是新功能也不是修复）
- perf：性能优化
- test：添加测试
- chore：构建过程或辅助工具的变动

**示例**：
```
feat(auth): add GitHub OAuth login

- Add passport-github2 dependency
- Implement OAuth flow
- Add user auto-creation

Closes #123
```

---

## 未来规划

### v2.2.0（计划中）

- ✅ 配置Google OAuth
- ✅ 集成富文本编辑器
- ✅ 实现文件上传功能
- ✅ 添加任务提醒（邮件/通知）
- ✅ 完善权限继承逻辑

### v3.0.0（计划中）

- 实时协作（WebSocket）
- 团队协作功能
- 项目看板视图
- 甘特图视图
- 数据统计和报表
- 移动端APP
- 数据库迁移到PostgreSQL
- 添加缓存层（Redis）

---

**文档版本**: v2.1
**最后更新**: 2026-04-01
**维护者**: 白晶晶
