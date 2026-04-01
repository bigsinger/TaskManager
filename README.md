# TaskManager

<div align="center">

**企业级多租户任务管理系统**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-2.1.0-blue)](https://github.com/bigsinger/TaskManager/releases)

[功能特性](#-核心功能) • [快速开始](#-快速开始) • [文档](#-文档) • [贡献](#-贡献) • [许可证](#-许可证)

</div>

---

## 项目简介

TaskManager v2.1是一个企业级多租户任务管理系统，提供简单易用的任务管理界面，支持多租户、组织架构、角色权限、任务评论等企业级特性。

### 核心特性

- ✅ **多租户支持**：完整的SaaS模式，数据完全隔离
- ✅ **组织架构**：三级层级（Department → Team → Squad）
- ✅ **角色权限**：细粒度的RBAC权限控制
- ✅ **任务评论**：支持Markdown、@提及、附件
- ✅ **OAuth登录**：支持GitHub和Google第三方登录
- ✅ **JWT认证**：无状态认证，适合微服务
- ✅ **任务管理**：完整的CRUD操作
- ✅ **主题切换**：浅色/深色/系统主题
- ✅ **多语言**：英语/中文支持
- ✅ **响应式设计**：移动端和桌面端完美支持

### 技术栈

#### 前端
- HTML5 + CSS3
- Vanilla JavaScript (ES6+)
- Fetch API
- Service Worker (离线支持）

#### 后端
- Node.js (v18+)
- Express.js
- SQLite3 (数据库）
- Passport.js (认证）
- JWT (无状态认证）

---

## 📸 核心功能

### 多租户支持

- 🏢 租户注册（公司名称、子域名）
- 🔐 完全的数据隔离
- 👥 每个租户独立的用户空间
- 🎯 所有操作都验证tenant_id

### 组织架构

- 📂 三级层级：Department → Team → Squad
- 🌳 树形结构查询
- 👥 用户-组织关联
- 🎯 任务可关联到任一层级

### 角色权限控制（RBAC）

#### Owner（拥有者）
- ✅ 完全访问权限
- ✅ 管理用户和组织
- ✅ 分配角色
- ✅ 管理租户设置

#### Project Manager（项目经理）
- ✅ 查看/创建/编辑/删除所有任务
- ✅ 分配任务给执行者
- ✅ 添加和回复评论
- ✅ 修改任务状态

#### Task Executor（任务执行者）
- ✅ 查看所有任务
- ✅ 只能修改自己任务的状态
- ✅ 可以添加评论（回复）

### 任务评论

- 💬 支持Markdown格式
- 🏷️ 支持@提及其他用户
- 📎 支持附件（文件链接）
- 💬 支持评论回复（嵌套）
- 📅 记录评论历史

### 第三方OAuth登录

#### GitHub OAuth ✅
- 🔑 GitHub OAuth 2.0
- 👤 自动创建用户
- 🎯 自动分配到default租户
- 🎭 自动分配role-executor角色
- 🔑 JWT token认证

#### Google OAuth
- 🔑 Google OAuth 2.0
- ⏳ 代码完成，待配置

### 任务管理

- 📝 创建任务（标题、描述、状态、标签）
- ✏️ 编辑任务
- 🗑️ 删除任务（渐进式消失）
- 📋 查看任务列表
- 🔍 状态筛选（Pending/In Progress/Completed）
- 🏷️ 标签筛选
- 🎯 任务搜索

### 用户体验

- 🎨 流畅的动画效果
- 🎯 清晰的视觉反馈
- 📱 移动端支持
- 🌐 局域网访问
- 🔄 Service Worker离线支持

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- SQLite3

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/bigsinger/TaskManager.git
cd TaskManager
```

#### 2. 安装依赖

```bash
# 后端
cd src/backend
npm install

# 前端
cd ../frontend
npm install
```

#### 3. 配置环境变量

```bash
cd src/backend
cp .env.example .env

# 编辑.env文件
```

```env
PORT=3000
DATABASE_URL=file:./tasks.db
JWT_SECRET=your-secret-key-change-in-production

# GitHub OAuth (可选）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Google OAuth (可选）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# 前端地址
APP_URL=http://localhost:3001
```

#### 4. 配置GitHub OAuth（可选）

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: TaskManager
   - Homepage URL: http://localhost:3001
   - Authorization callback URL: http://localhost:3000/api/auth/github/callback
4. 创建后获取 Client ID和Client Secret
5. 填写到`.env`文件中

#### 5. 启动服务

```bash
# 后端（终端1）
cd src/backend
npm start

# 前端（终端2）
cd src/frontend
npm start
```

#### 6. 访问应用

- 前端: http://localhost:3001
- 后端: http://localhost:3000
- 登录页: http://localhost:3001/login.html

---

## 📚 文档

### 用户文档

- [OAuth配置指南](./OAUTH_SETUP.md) - 配置GitHub和Google OAuth
- [清除浏览器缓存指南](./CLEAR_CACHE.md) - 解决缓存问题
- [OAuth错误修复指南](./FIX_OAUTH_ERROR.md) - OAuth问题排查
- [服务管理指南](./SERVICE_MANAGEMENT.md) - 启动和管理服务

### 开发文档

- [需求文档](./doc/REQUIREMENTS.md) - 完整的功能需求
- [设计文档](./doc/v2.1-design.md) - v2.1设计方案
- [测试文档](./doc/TESTING.md) - 完整的测试指南
- [API文档](./doc/api.md) - API接口文档
- [数据库设计](./doc/database-design.md) - 数据库结构
- [前端设计](./doc/frontend-design.md) - 前端架构

### 其他文档

- [更新日志](./CHANGELOG.md) - 版本更新记录
- [前端改进文档](./FRONTEND_IMPROVEMENTS.md) - UI改进详情
- [项目状态](./PROJECT_STATUS.md) - 当前开发状态

---

## 🧪 测试

### 运行测试

```bash
# 后端测试
cd src/backend
npm test

# 前端测试
cd src/frontend
npm test
```

### 测试覆盖率

- 后端: > 80%
- 前端: > 70%
- 关键路径: 100%

---

## 📊 项目结构

```
TaskManager/
├── src/
│   ├── backend/           # 后端代码
│   │   ├── database.js  # 数据库操作
│   │   ├── server.js    # Express服务器
│   │   ├── oauth.js     # OAuth服务
│   │   ├── fix-database.js  # 数据库迁移
│   │   ├── __tests__/   # 单元测试
│   │   └── package.json
│   └── frontend/          # 前端代码
│       ├── index.html   # 主页面
│       ├── login.html   # 登录页面
│       ├── register.html # 注册页面
│       ├── oauth-callback.html # OAuth回调
│       ├── app.js      # 主应用逻辑
│       ├── authService.js # 认证服务
│       ├── style.css   # 样式
│       ├── sw.js       # Service Worker
│       └── package.json
├── doc/               # 文档
│   ├── REQUIREMENTS.md
│   ├── TESTING.md
│   ├── v2.1-design.md
│   └── ...
├── .env.example       # 环境变量示例
├── CHANGELOG.md       # 更新日志
├── README.md          # 本文件
└── LICENSE            # MIT许可证
```

---

## 🔄 更新日志

### [v2.1.0] - 2026-04-01

#### ✨ 新增功能
- 多租户支持（完整的SaaS模式）
- 组织架构（三级层级）
- 角色权限控制（RBAC）
- 任务评论（Markdown、@提及、附件）
- GitHub OAuth登录
- Google OAuth代码实现

#### 🔧 改进
- UI改进（按钮更大、时间显示优化）
- 前端改进（自动刷新、标签解析）
- 后端改进（JWT认证、自动迁移）
- Service Worker改进（只缓存GET）

#### 🐛 修复
- OAuth登录错误
- JWT认证问题
- 任务CRUD错误
- 数据库迁移问题

完整更新日志：[CHANGELOG.md](./CHANGELOG.md)

---

## 🛠️ 开发指南

### 代码规范

- 后端: ESLint + Prettier
- 前端: ESLint + Prettier
- 提交: Conventional Commits

### Git工作流

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 提交更改
git add .
git commit -m "feat: add your feature"

# 3. 推送到远程
git push origin feature/your-feature

# 4. 创建Pull Request
```

---

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 贡献者

- [白晶晶](https://github.com/baoyu) - 主要开发者

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源。

---

## 📞 联系方式

- 项目地址: https://github.com/bigsinger/TaskManager
- 问题反馈: https://github.com/bigsinger/TaskManager/issues
- 文档地址: https://github.com/bigsinger/TaskManager/tree/main/doc

---

## 🎯 未来规划

### v2.2.0（计划中）
- [ ] 配置Google OAuth
- [ ] 集成富文本编辑器
- [ ] 实现文件上传功能
- [ ] 添加任务提醒

### v3.0.0（计划中）
- [ ] 实时协作（WebSocket）
- [ ] 团队协作功能
- [ ] 项目看板视图
- [ ] 甘特图视图
- [ ] 数据统计和报表

完整路线图：[PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

<div align="center">

**如果这个项目对你有帮助，请给个⭐️支持一下！**

Made with ❤️ by 白晶晶

</div>
