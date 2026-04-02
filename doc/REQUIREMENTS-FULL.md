# TaskManager 完整需求文档

> **项目**: TaskManager 企业级任务管理系统
> **当前版本**: v2.2.0
> **创建日期**: 2026-03-30
> **最后更新**: 2026-04-03
> **维护人**: 白晶晶

---

## 📋 文档概述

本文档整合了 TaskManager 项目从 v1.0 到 v2.2 的所有需求,包括:
- v1.0 基础功能需求
- v1.2 中低优先级改进需求
- v2.1 企业级功能需求
- v2.2 用户体验优化需求

---

## 🎯 项目愿景

TaskManager 是一个企业级多租户任务管理系统,提供简单易用的任务管理界面,支持多租户、组织架构、角色权限、任务评论等企业级特性。

### 核心价值
- 🏢 **多租户支持**: 完整的SaaS模式,数据完全隔离
- 👥 **组织架构**: 三级层级(Department → Team → Squad)
- 🔐 **角色权限**: 细粒度的RBAC权限控制
- 💬 **任务评论**: 支持Markdown、@提及、附件
- 🎨 **用户体验**: 手势交互、时间线、情境管理

---

## 📊 版本演进

### v1.0 - 基础功能(2026-03-30)
**目标**: 实现基础的任务管理功能

**核心功能**:
- ✅ 任务CRUD(创建、读取、更新、删除)
- ✅ 任务状态管理(Pending/In Progress/Completed)
- ✅ 任务标签系统
- ✅ 任务搜索和筛选
- ✅ 任务分页显示
- ✅ 主题切换(Light/Dark/System)
- ✅ 多语言支持(中文/英文)
- ✅ 响应式设计

**技术栈**:
- 前端: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- 后端: Node.js + Express + SQLite3
- 认证: JWT + Passport.js

---

### v1.2 - 中低优先级改进(2026-03-31)
**目标**: 提升用户体验和功能完善度

**高优先级改进(13项,100%完成)**:
1. ✅ 撤销/重做功能 - Command模式实现,支持Ctrl+Z/Y
2. ✅ 快捷键支持 - Ctrl+N新建、Ctrl+S保存、Ctrl+F搜索、Ctrl+E导出、?帮助
3. ✅ 批量操作 - 多选任务、批量完成、批量删除
4. ✅ 拖拽功能 - HTML5 Drag and Drop API,任务拖拽排序
5. ✅ 任务模板 - 本地存储预设模板,快速创建常用任务
6. ✅ 任务提醒 - 浏览器Notification API + 定时检查
7. ✅ 任务统计 - 任务概览、状态分布、标签统计、完成率
8. ✅ 前端框架迁移 - Vite + React + Ant Design
9. ✅ 构建工具优化 - Vite构建
10. ✅ UI组件库 - Ant Design
11. ✅ 任务依赖关系 - 任务间依赖管理
12. ✅ 任务甘特图 - 可视化时间线
13. ✅ 任务看板 - Kanban视图

**中优先级改进(10项,50%完成)**:
14. ✅ 撤销/重做功能
15. ✅ 快捷键支持
16. ✅ 批量操作
17. ⏳ 拖拽功能(基础代码已创建,需集成到UI)
18. ⏳ 任务模板(基础代码已创建,需完善UI)
19. ⏳ 任务提醒(待实现)
20. ✅ 任务统计
21-23. ⏳ 前端框架/构建工具/UI组件库(建议作为v2.0的主要目标)

**低优先级改进(10项,0%完成)**:
24-27. ⏳ 高级功能(任务依赖关系、甘特图、看板、时间追踪)
28-30. ⏳ AI集成(智能分类、智能标签、智能优先级)
31-33. ⏳ 协作功能(实时协作、团队协作、任务评论)

**v1.2 总体进度**: 18/33 (55%)

---

### v2.1 - 企业级功能(2026-04-01)
**目标**: 实现企业级多租户、组织架构、权限管理

**核心功能**:

#### 1. 多租户架构
- 🏢 租户注册(公司名称、子域名)
- 🔐 完全的数据隔离
- 👥 每个租户独立的用户空间
- 🎯 所有操作都验证tenant_id

**数据库设计**:
```sql
-- 租户表
tenants:
  - id: UUID PRIMARY KEY
  - name: VARCHAR(100) 公司名称
  - subdomain: VARCHAR(50) UNIQUE 子域名
  - status: ENUM('active', 'suspended', 'deleted')
  - created_at, updated_at

-- 用户表增加tenant_id
tenants_users:
  - id: UUID PRIMARY KEY
  - tenant_id: UUID FK → tenants.id
  - email: VARCHAR(100) UNIQUE
  - name: VARCHAR(100)
  - password_hash: VARCHAR(255)
  - role: ENUM('owner', 'admin', 'user')
  - status: ENUM('active', 'inactive')
  - created_at, updated_at
```

#### 2. 组织架构(三级Group)
**层级结构**:
```
租户 (Tenant)
├── 一级部门 (Department)
│   ├── 二级团队 (Team)
│   │   ├── 三级小组 (Group)
│   │   └── 三级小组 (Group)
│   └── 二级团队 (Team)
└── 一级部门 (Department)
    └── ...
```

**数据库设计**:
```sql
-- 组织架构表
groups:
  - id: UUID PRIMARY KEY
  - tenant_id: UUID FK → tenants.id
  - parent_id: UUID FK → groups.id (nullable, 顶级为null)
  - name: VARCHAR(100) 组织名称
  - level: TINYINT 层级 (1, 2, 3)
  - type: ENUM('department', 'team', 'squad') 类型
  - manager_id: UUID FK → tenants_users.id 负责人
  - created_at, updated_at

-- 用户-组织关联表
group_members:
  - id: UUID PRIMARY KEY
  - group_id: UUID FK → groups.id
  - user_id: UUID FK → tenants_users.id
  - joined_at: TIMESTAMP
  - UNIQUE(group_id, user_id)
```

#### 3. 权限系统(RBAC)
**角色设计**:
| 角色 | 英文 | 权限范围 |
|------|------|----------|
| 拥有者 | Owner | 全部权限(创建租户时自动分配) |
| 任务执行者 | TaskExecutor | 只能修改自己任务的状态 |
| 项目管理者 | ProjectManager | 可修改/变更状态,不可修改任务内容,可追加评论 |

**数据库设计**:
```sql
-- 角色表
roles:
  - id: UUID PRIMARY KEY
  - tenant_id: UUID FK → tenants.id
  - name: VARCHAR(50) 角色名
  - permissions: JSON 权限配置
  - is_system: BOOLEAN 是否系统预设

-- 用户角色表(一个用户可有多个角色)
user_roles:
  - id: UUID PRIMARY KEY
  - user_id: UUID FK → tenants_users.id
  - role_id: UUID FK → roles.id
  - assigned_at: TIMESTAMP
  - UNIQUE(user_id, role_id)
```

#### 4. 任务评论
**功能特性**:
- 💬 支持Markdown格式
- 🏷️ 支持@提及其他用户
- 📎 支持附件(文件链接)
- 💬 支持评论回复(嵌套)
- 📅 记录评论历史

**数据库设计**:
```sql
-- 任务评论表
task_comments:
  - id: UUID PRIMARY KEY
  - task_id: UUID FK → tasks.id
  - user_id: UUID FK → tenants_users.id
  - content: TEXT 评论内容(Markdown)
  - parent_id: UUID FK → task_comments.id (回复评论)
  - attachments: JSON 附件列表
  - mentions: JSON @提及的用户列表
  - created_at: TIMESTAMP
  - updated_at: TIMESTAMP
```

#### 5. OAuth登录
**GitHub OAuth ✅**:
- 🔑 GitHub OAuth 2.0
- 👤 自动创建用户
- 🎯 自动分配到default租户
- 🎭 自动分配role-executor角色

**Google OAuth ✅**:
- 🔑 Google OAuth 2.0
- 👤 自动创建用户
- 🎯 自动分配到default租户
- 🎭 自动分配role-executor角色

**v2.1 总体进度**: 100% 完成

---

### v2.2 - 用户体验优化(2026-04-02)
**目标**: 提升用户体验,增加手势交互、时间线、情境管理等功能

**核心需求(9项)**:

#### 1. 任务时间线 (Timeline)
**需求描述**:
- 为每个任务创建完整的时间线,记录所有操作历史
- 时间线节点包括:创建、开始、评论、编辑、状态变更、完成、分配、收藏
- 时间线显示在任务详情页
- 支持按时间顺序展示操作记录

**用户故事**:
作为用户,我希望能够看到任务的所有操作历史,以便了解任务的进展和变化。

**技术实现**:
- 后端: Timeline 表,记录所有任务操作
- 前端: TaskTimeline 组件,按时间展示操作记录
- API: 获取任务时间线,创建时间线节点,删除时间线节点

**实现状态**: 33% 完成
- ✅ 数据库函数: `getTaskActivities()` 已实现
- ❌ API端点: 缺失 `GET /api/tasks/:id/activities` 端点
- ✅ 前端组件: TaskTimeline 组件已创建
- ❌ 集成状态: 未集成到任务详情页

---

#### 2. 手势交互 (Gesture Interaction)
**需求描述**:
- 在任务卡片上支持手势操作
- 向右滑动: 切换任务状态(未开始 → 进行中 → 已完成 → 未开始)
- 向左滑动: 显示任务时间线
- 支持移动端触摸和PC端鼠标拖拽

**用户故事**:
作为用户,我希望能够通过滑动快速切换任务状态或查看时间线,提高操作效率。

**技术实现**:
- 前端: SwipeableTaskCard 组件,集成手势处理
- Hook: useSwipeGesture,处理触摸和鼠标事件
- 动画: Framer Motion,流畅的滑动动画效果

**实现状态**: 0% 完成
- ✅ 前端组件: SwipeableTaskCard 组件已创建
- ✅ Hook: useSwipeGesture 已实现
- ❌ 集成状态: 未集成到任务列表

---

#### 3. 情境(项目)管理 (Context Management)
**需求描述**:
- 支持创建、编辑、删除情境(项目)
- 每个任务属于一个情境
- 支持在情境之间切换
- 显示当前情境的所有任务

**用户故事**:
作为用户,我希望能够创建不同的项目(情境),并在项目之间切换,以便更好地组织任务。

**技术实现**:
- 后端: Context 表,Context CRUD API
- 前端: ContextSwitcher 组件,显示和切换情境
- 状态管理: Zustand Store,保存当前情境

**数据库设计**:
```sql
CREATE TABLE IF NOT EXISTS contexts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar TEXT,
  owner_id TEXT NOT NULL,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
)

-- 任务表添加情境ID
ALTER TABLE tasks ADD COLUMN context_id TEXT;
```

**实现状态**: 67% 完成
- ✅ 数据库: contexts 表已创建
- ✅ API端点: GET/POST/PUT /api/contexts 已实现
- ✅ 前端组件: ContextSwitcher 组件已创建
- ⚠️ 集成状态: 部分集成到主应用

---

#### 4. 情境切换组件 (Context Switcher)
**需求描述**:
- 显示所有可用的情境列表
- 支持快速切换当前情境
- 高亮显示当前激活的情境
- 显示情境的任务数量

**用户故事**:
作为用户,我希望能够快速切换当前项目,查看不同项目的任务。

**技术实现**:
- 前端: ContextSwitcher 组件
- API: 获取用户的所有情境
- 状态管理: 更新当前情境,重新加载任务列表

**实现状态**: 67% 完成
- ✅ 前端组件: ContextSwitcher 组件已创建
- ✅ API端点: GET /api/contexts 已实现
- ⚠️ 集成状态: 部分集成到主应用

---

#### 5. 用户头像 (User Avatar)
**需求描述**:
- 显示用户的头像、昵称
- 支持第三方登录的昵称显示
- 点击头像进入个人中心
- 支持上传头像(v2.3)

**用户故事**:
作为用户,我希望能够看到我的头像和昵称,并且点击后可以进入个人中心查看我的信息。

**技术实现**:
- 后端: User 表的 avatar、nickname 字段
- 前端: UserAvatar 组件,显示头像和昵称
- API: 获取用户信息,更新用户信息

**实现状态**: 67% 完成
- ✅ 数据库: users 表已添加 avatar、nickname 字段
- ✅ API端点: GET/PUT /api/users/:id 已实现
- ✅ 前端组件: UserAvatar 组件已创建
- ⚠️ 集成状态: 部分集成到主应用

---

#### 6. 任务预计耗时 (Estimated Time)
**需求描述**:
- 为任务设置预计完成时间
- 支持时间单位:小时(h)、天(d)、周(w)、月(mo)、季度(q)、年(y)
- 显示为格式化字符串(如"8小时"、"3天")
- 在任务卡片和详情页显示

**用户故事**:
作为用户,我希望能够为每个任务设置预计完成时间,以便更好地规划工作。

**技术实现**:
- 后端: Task 表的 estimated_time 字段(value + unit)
- 前端: EstimatedTimeSelector 组件,选择时间和单位
- 格式化: timeFormatter 工具,转换为显示字符串

**数据库设计**:
```sql
-- 任务表添加预计耗时字段
ALTER TABLE tasks ADD COLUMN estimated_time TEXT; -- JSON格式: {value, unit, display}
```

**实现状态**: 100% 完成
- ✅ 数据库: tasks 表已添加 estimated_time 字段
- ✅ API端点: POST/PUT /api/tasks 已支持 estimated_time
- ✅ 前端组件: EstimatedTimeSelector 组件已创建
- ✅ 集成状态: 已集成到任务创建/编辑表单

---

#### 7. 任务角色信息 (Task Roles)
**需求描述**:
- 每个任务支持三种角色:执行者(assignee)、报告人(reporter)、验证人(verifier)
- 在任务详情页显示角色信息
- 支持选择不同的用户担任不同角色
- 显示角色的头像和昵称

**用户故事**:
作为用户,我希望能够为任务分配执行者、报告人和验证人,以便明确责任分工。

**技术实现**:
- 后端: Task 表的 assignee_id、reporter_id、verifier_id 字段
- 前端: RoleSelector 组件,选择用户角色
- API: 获取用户列表,更新任务角色

**数据库设计**:
```sql
-- 任务表添加角色字段
ALTER TABLE tasks ADD COLUMN reporter_id TEXT;
ALTER TABLE tasks ADD COLUMN verifier_id TEXT;
```

**实现状态**: 67% 完成
- ✅ 数据库: tasks 表已添加 reporter_id、verifier_id 字段
- ✅ API端点: POST/PUT /api/tasks 已支持角色字段
- ✅ 前端组件: RoleSelector 组件已创建
- ⚠️ 集成状态: 部分集成到任务详情页

---

#### 8. 任务收藏功能 (Task Favorite)
**需求描述**:
- 支持收藏/取消收藏任务
- 在任务卡片上显示收藏按钮(五角星图标)
- 收藏状态用黄色五角星表示,未收藏用灰色五角星
- 点击收藏按钮切换收藏状态,带动画效果
- 支持筛选收藏的任务

**用户故事**:
作为用户,我希望能够收藏重要任务,以便快速访问和筛选。

**技术实现**:
- 后端: Task 表的 is_favorite 字段
- 前端: FavoriteButton 组件,显示收藏按钮
- API: 更新任务收藏状态
- 筛选: 支持按收藏状态筛选任务

**数据库设计**:
```sql
-- 任务表添加收藏字段
ALTER TABLE tasks ADD COLUMN is_favorite INTEGER DEFAULT 0;
```

**实现状态**: 100% 完成
- ✅ 数据库: tasks 表已添加 is_favorite 字段
- ✅ API端点: PATCH /api/tasks/:id 已支持 is_favorite
- ✅ 前端组件: FavoriteButton 组件已创建
- ✅ 集成状态: 已集成到任务列表
- ✅ 筛选功能: 支持按收藏状态筛选

---

#### 9. 用户个人中心 (User Profile)
**需求描述**:
- 显示用户个人信息(头像、昵称、邮箱)
- 支持编辑个人信息
- 显示用户统计信息(任务数量、完成率等)
- 支持上传头像(v2.3)

**用户故事**:
作为用户,我希望能够查看和编辑我的个人信息,了解我的任务统计。

**技术实现**:
- 后端: User 表的个人信息字段
- 前端: UserProfile 组件,显示和编辑个人信息
- API: 获取用户信息,更新用户信息

**实现状态**: 67% 完成
- ✅ 数据库: users 表已添加个人信息字段
- ✅ API端点: GET/PUT /api/users/:id 已实现
- ✅ 前端组件: UserProfile 组件已创建
- ⚠️ 集成状态: 部分集成到主应用

---

**v2.2 总体进度**: 67% 完成(6/9 功能完全实现,3/9 功能部分实现)

---

## 📊 功能实现状态总览

| # | 功能名称 | 后端API | 前端组件 | 集成状态 | 完成度 | 优先级 |
|---|---------|---------|-----------|---------|--------|--------|
| 1 | 任务时间线 | ⚠️ | ✅ | ❌ | 33% | 高 |
| 2 | 手势交互 | N/A | ✅ | ❌ | 0% | 高 |
| 3 | 情境管理 | ✅ | ✅ | ⚠️ | 67% | 高 |
| 4 | 情境切换器 | ✅ | ✅ | ⚠️ | 67% | 高 |
| 5 | 用户头像 | ✅ | ✅ | ⚠️ | 67% | 中 |
| 6 | 任务预计耗时 | ✅ | ✅ | ✅ | 100% | 中 |
| 7 | 任务角色信息 | ✅ | ✅ | ⚠️ | 67% | 中 |
| 8 | 任务收藏功能 | ✅ | ✅ | ✅ | 100% | 高 |
| 9 | 用户个人中心 | ✅ | ✅ | ⚠️ | 67% | 中 |

**v2.2 总体完成度**: 67%

---

## 🎯 待完成功能

### 高优先级(立即完成)
1. **任务时间线集成** - 添加API端点,集成到任务详情页
2. **手势交互集成** - 集成到任务列表,实现滑动操作
3. **情境管理完善** - 完善情境切换和筛选功能

### 中优先级(本周完成)
1. **用户头像完善** - 完善头像显示和个人中心
2. **任务角色信息完善** - 完善角色选择和显示
3. **用户个人中心完善** - 完善个人信息编辑和统计

### 低优先级(下周完成)
1. **头像上传功能** - 支持用户上传自定义头像
2. **任务统计优化** - 优化统计图表和数据分析
3. **性能优化** - 优化前端性能和加载速度

---

## 📝 需求变更记录

| 日期 | 版本 | 变更内容 | 变更原因 |
|------|------|----------|----------|
| 2026-03-30 | v1.0 | 初始版本,基础功能 | 项目启动 |
| 2026-03-31 | v1.2 | 添加中低优先级改进 | 用户体验提升 |
| 2026-04-01 | v2.1 | 添加企业级功能 | 企业客户需求 |
| 2026-04-02 | v2.2 | 添加用户体验优化 | 用户反馈优化 |
| 2026-04-03 | v2.2 | 整合所有需求文档 | 文档整理 |

---

## 🔗 相关文档

- [设计文档](./DESIGN-FULL.md)
- [测试文档](./TESTING-FULL.md)
- [部署运维文档](./DEPLOYMENT-FULL.md)
- [使用文档](./USAGE-FULL.md)

---

**文档维护**: 白晶晶
**最后更新**: 2026-04-03
**下次审查**: 2026-04-10
