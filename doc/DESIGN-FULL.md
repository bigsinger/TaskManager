# TaskManager 完整设计文档

> **项目**: TaskManager 企业级任务管理系统
> **当前版本**: v2.2.0
> **创建日期**: 2026-03-30
> **最后更新**: 2026-04-03
> **维护人**: 白晶晶

---

## 📋 文档概述

本文档整合了 TaskManager 项目从 v1.0 到 v2.2 的所有设计内容,包括:
- v1.0 基础功能设计
- v1.2 安全与性能优化设计
- v2.1 企业级功能设计
- v2.2 用户体验优化设计

---

## 🏗️ 系统架构

### 整体架构

TaskManager 采用前后端分离架构,前端使用 React + TypeScript + Vite,后端使用 Node.js + Express + TypeScript + Prisma。

```
┌─────────────────────────────────────────────────────────┐
│                        前端层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React     │  │  TypeScript  │  │    Vite      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           │
┌─────────────────────────────────────────────────────────┐
│                        后端层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Express    │  │  TypeScript  │  │   Prisma     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │
┌─────────────────────────────────────────────────────────┐
│                        数据层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   Storage    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 前端架构

前端采用模块化设计,主要模块包括:

1. **页面模块** (Pages)
   - LoginPage - 登录页
   - TaskListPage - 任务列表页
   - TaskDetailPage - 任务详情页
   - UserProfilePage - 用户个人中心

2. **组件模块** (Components)
   - TaskCard - 任务卡片
   - TaskList - 任务列表
   - TaskTimeline - 任务时间线
   - ContextSwitcher - 情境切换器
   - UserAvatar - 用户头像
   - FavoriteButton - 收藏按钮

3. **状态管理** (Stores)
   - useTaskStore - 任务状态管理
   - useUserStore - 用户状态管理
   - useContextStore - 情境状态管理

4. **工具模块** (Utils)
   - api - API 请求封装
   - formatters - 格式化工具
   - validators - 验证工具

### 后端架构

后端采用分层架构,遵循 DDD(领域驱动设计)原则:

1. **适配器层** (Adapters)
   - 控制器 (Controllers)
   - 路由 (Routes)
   - 中间件 (Middleware)

2. **应用层** (Application)
   - 用例 (Use Cases)
   - 服务 (Services)
   - DTO (Data Transfer Objects)

3. **领域层** (Domain)
   - 实体 (Entities)
   - 值对象 (Value Objects)
   - 仓储接口 (Repository Interfaces)

4. **基础设施层** (Infrastructure)
   - 仓储实现 (Repository Implementations)
   - 数据库连接 (Database Connection)
   - 缓存服务 (Cache Service)
   - 日志服务 (Logger Service)
   - 安全服务 (Security Service)

---

## 💾 数据库设计

### 数据库选择

使用 PostgreSQL 作为主数据库,Redis 作为缓存数据库。

- **PostgreSQL**: 关系型数据库,存储核心业务数据
- **Redis**: 内存数据库,用于缓存和会话管理

### 数据表设计

#### 租户表 (tenants)

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  subdomain String   @unique
  status    String   @default("active") // active, suspended, deleted
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  groups    Group[]
  contexts  Context[]

  @@index([subdomain])
}
```

#### 用户表 (users)

```prisma
model User {
  id          String   @id @default(uuid())
  tenantId    String
  email       String   @unique
  password    String
  name        String
  nickname    String?
  avatar      String?
  description String?
  role        String   @default("user") // owner, admin, user
  status      String   @default("active") // active, inactive
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tasks       Task[]
  comments    Comment[]
  groupMembers GroupMember[]

  @@index([tenantId])
  @@index([email])
}
```

#### 组织架构表 (groups)

```prisma
model Group {
  id        String   @id @default(uuid())
  tenantId  String
  parentId  String?
  name      String
  level     Int      // 1: department, 2: team, 3: squad
  type      String   // department, team, squad
  managerId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant     Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  parent     Group?        @relation("GroupHierarchy", fields: [parentId], references: [id])
  children   Group[]       @relation("GroupHierarchy")
  members    GroupMember[]

  @@index([tenantId])
  @@index([parentId])
}
```

#### 用户组织关联表 (group_members)

```prisma
model GroupMember {
  id        String   @id @default(uuid())
  groupId   String
  userId    String
  joinedAt  DateTime @default(now())

  group     Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@index([groupId])
  @@index([userId])
}
```

#### 角色表 (roles)

```prisma
model Role {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  permissions Json
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userRoles   UserRole[]

  @@unique([tenantId, name])
  @@index([tenantId])
}
```

#### 用户角色表 (user_roles)

```prisma
model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  groupId   String?
  assignedAt DateTime @default(now())

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId, groupId])
  @@index([userId])
  @@index([roleId])
}
```

#### 情境表 (contexts)

```prisma
model Context {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  description String?
  avatar      String?
  ownerId     String
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  owner       User   @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  tasks       Task[]

  @@index([tenantId])
  @@index([ownerId])
}
```

#### 任务表 (tasks)

```prisma
model Task {
  id             String   @id @default(uuid())
  tenantId       String
  contextId      String?
  title          String
  description    String?
  status         String   @default("pending") // pending, in-progress, completed
  tags           String[] @default([])
  priority       Int      @default(0)
  estimatedTime  Json?    // { value, unit, display }
  isFavorite     Boolean  @default(false)
  assigneeId     String?
  reporterId     String?
  verifierId     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  context   Context?  @relation(fields: [contextId], references: [id], onDelete: SetNull)
  assignee  User?     @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  reporter  User?     @relation("TaskReporter", fields: [reporterId], references: [id], onDelete: SetNull)
  verifier  User?     @relation("TaskVerifier", fields: [verifierId], references: [id], onDelete: SetNull)
  comments  Comment[]
  timeline  Timeline[]

  @@index([tenantId])
  @@index([contextId])
  @@index([status])
  @@index([assigneeId])
  @@index([createdAt])
  @@index([status, createdAt])
}
```

#### 任务评论表 (comments)

```prisma
model Comment {
  id          String   @id @default(uuid())
  taskId      String
  userId      String
  content     String
  contentType String   @default("markdown") // text, markdown, html
  parentId    String?
  attachments Json?
  mentions    String[] @default([])
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  task    Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent  Comment? @relation("CommentReply", fields: [parentId], references: [id], onDelete: Cascade)
  replies Comment[] @relation("CommentReply")

  @@index([taskId])
  @@index([userId])
  @@index([parentId])
}
```

#### 任务时间线表 (timeline)

```prisma
model Timeline {
  id        String   @id @default(uuid())
  taskId    String
  action    String   // create, start, comment, edit, status_change, complete, assign, favorite
  actorId   String
  details   Json?
  createdAt DateTime @default(now())

  task  Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([actorId])
  @@index([createdAt])
}
```

#### 审计日志表 (audit_logs)

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String
  resourceId String?
  details   String?
  ipAddress String?
  userAgent String?
  status    String   @default("success")
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([resource])
  @@index([createdAt])
}
```

---

## 🔐 安全设计

### 1. 认证和授权

#### 1.1 JWT 认证

```typescript
// 生成 JWT Token
function generateToken(userId: string, tenantId: string): string {
  return jwt.sign(
    { userId, tenantId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证 JWT Token
function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
}
```

#### 1.2 OAuth 登录

**GitHub OAuth**:
```typescript
// GitHub OAuth 配置
const githubOAuth = new OAuth2({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: process.env.GITHUB_REDIRECT_URI
});
```

**Google OAuth**:
```typescript
// Google OAuth 配置
const googleOAuth = new OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
});
```

#### 1.3 RBAC 权限控制

```typescript
// 权限常量
const PERMISSIONS = {
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  TASK_STATUS_CHANGE: 'task:status:change',
  TASK_COMMENT: 'task:comment',
  TASK_ASSIGN: 'task:assign',
  ROLE_CREATE: 'role:create',
  ROLE_ASSIGN: 'role:assign',
  GROUP_CREATE: 'group:create',
  GROUP_MANAGE: 'group:manage'
};

// 默认角色权限
const DEFAULT_ROLES = {
  Owner: {
    permissions: ['*']
  },
  TaskExecutor: {
    permissions: [
      'task:status:change:own',
      'task:comment'
    ]
  },
  ProjectManager: {
    permissions: [
      'task:status:change',
      'task:comment',
      'task:assign'
    ]
  }
};
```

### 2. CSRF 防护

```typescript
import csrf from 'csurf';

// CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Get CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({
    csrfToken: req.csrfToken()
  });
});
```

### 3. 速率限制

```typescript
import rateLimit from 'express-rate-limit';

// 全局限速
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 100, // 最多 100 个请求
  message: 'Too many requests, please try again later'
});

// 认证限速
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 最多 5 个请求
  message: 'Too many authentication attempts, please try again later'
});

// IP 限速
const ipLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 50, // 最多 50 个请求
  keyGenerator: (req) => req.ip,
  message: 'Too many requests from this IP, please try again later'
});

// 用户限速
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 30, // 最多 30 个请求
  keyGenerator: (req) => req.user?.id,
  message: 'Too many requests from this user, please try again later'
});
```

### 4. 输入验证

```typescript
import { z } from 'zod';

// 任务创建验证
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['pending', 'in-progress', 'completed']),
  tags: z.array(z.string()).max(10).optional(),
  priority: z.number().int().min(0).max(10).optional()
});

// 用户注册验证
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100)
});
```

---

## 🚀 性能优化

### 1. 数据库优化

#### 1.1 索引优化

```prisma
model Task {
  // ...

  @@index([tenantId])
  @@index([contextId])
  @@index([status])
  @@index([assigneeId])
  @@index([createdAt])
  @@index([status, createdAt]) // 复合索引
}
```

#### 1.2 查询优化

```typescript
// 使用索引查询
const tasks = await prisma.task.findMany({
  where: {
    tenantId: user.tenantId,
    status: 'pending'
  },
  orderBy: {
    createdAt: 'desc'
  },
  skip: (page - 1) * limit,
  take: limit
});

// 使用批量查询
const tasks = await prisma.task.findMany({
  include: {
    assignee: true,
    reporter: true,
    context: true
  }
});
```

### 2. 缓存优化

#### 2.1 Redis 缓存

```typescript
import Redis from 'ioredis';

const redis = new Redis();

// 缓存配置
const cacheConfig = {
  taskList: {
    ttl: 60 * 5, // 5 分钟
    key: (userId: string, filters: any) => `task:list:${userId}:${JSON.stringify(filters)}`
  },
  taskDetail: {
    ttl: 60 * 10, // 10 分钟
    key: (taskId: string) => `task:detail:${taskId}`
  },
  tagCloud: {
    ttl: 60 * 30, // 30 分钟
    key: (userId: string) => `tag:cloud:${userId}`
  },
  userInfo: {
    ttl: 60 * 60, // 1 小时
    key: (userId: string) => `user:info:${userId}`
  }
};

// 缓存任务列表
async function getTaskList(userId: string, filters: any) {
  const cacheKey = cacheConfig.taskList.key(userId, filters);
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const tasks = await prisma.task.findMany({
    where: filters,
    include: { assignee: true, reporter: true }
  });

  await redis.set(cacheKey, JSON.stringify(tasks), 'EX', cacheConfig.taskList.ttl);

  return tasks;
}
```

#### 2.2 缓存失效策略

```typescript
// 任务更新时失效相关缓存
async function updateTask(taskId: string, data: any) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data
  });

  // 失效任务详情缓存
  await redis.del(cacheConfig.taskDetail.key(taskId));

  // 失效用户任务列表缓存
  await redis.del(`task:list:${task.userId}:*`);

  // 失效标签云缓存
  await redis.del(`tag:cloud:${task.userId}`);

  return task;
}
```

### 3. 前端优化

#### 3.1 代码分割

```typescript
// 路由懒加载
import { lazy, Suspense } from 'react';

const TaskListPage = lazy(() => import('./pages/TaskListPage'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));

// 虚拟滚动
import { FixedSizeList as List } from 'react-window';

function TaskList({ tasks }) {
  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <TaskCard task={tasks[index]} />
        </div>
      )}
    </List>
  );
}
```

#### 3.2 组件优化

```typescript
import { memo, useMemo, useCallback } from 'react';

// 使用 memo 避免不必要的重渲染
const TaskCard = memo(({ task, onUpdate, onDelete }) => {
  // 使用 useMemo 缓存计算结果
  const formattedDate = useMemo(() => {
    return formatDistanceToNow(new Date(task.createdAt));
  }, [task.createdAt]);

  // 使用 useCallback 缓存函数
  const handleUpdate = useCallback(() => {
    onUpdate(task.id);
  }, [task.id, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  return (
    <div>
      <h3>{task.title}</h3>
      <p>{formattedDate}</p>
      <button onClick={handleUpdate}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
});
```

#### 3.3 状态管理优化

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 使用 Zustand 状态管理
const useTaskStore = create(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],
        filter: {},
        setTasks: (tasks) => set({ tasks }),
        addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
        updateTask: (id, data) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...data } : task
            )
          })),
        deleteTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id)
          }))
      }),
      { name: 'task-storage' }
    )
  )
);
```

---

## 🔧 API 设计

### RESTful API 规范

#### 基础 URL
```
http://localhost:3000/api/v1
```

#### 通用响应格式

**成功响应**:
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### API 端点

#### 认证 (Auth)

```
POST   /api/v1/auth/register     用户注册
POST   /api/v1/auth/login        用户登录
POST   /api/v1/auth/logout       用户登出
POST   /api/v1/auth/github       GitHub OAuth
POST   /api/v1/auth/google       Google OAuth
GET    /api/v1/auth/me           获取当前用户信息
```

#### 任务 (Tasks)

```
GET    /api/v1/tasks             获取任务列表
POST   /api/v1/tasks             创建任务
GET    /api/v1/tasks/:id         获取任务详情
PUT    /api/v1/tasks/:id         更新任务
DELETE /api/v1/tasks/:id         删除任务
PATCH  /api/v1/tasks/:id/favorite 切换收藏状态
GET    /api/v1/tasks/:id/timeline 获取任务时间线
```

#### 情境 (Contexts)

```
GET    /api/v1/contexts          获取情境列表
POST   /api/v1/contexts          创建情境
GET    /api/v1/contexts/:id      获取情境详情
PUT    /api/v1/contexts/:id      更新情境
DELETE /api/v1/contexts/:id      删除情境
```

#### 评论 (Comments)

```
GET    /api/v1/tasks/:taskId/comments      获取评论列表
POST   /api/v1/tasks/:taskId/comments      创建评论
GET    /api/v1/comments/:id                获取评论详情
PUT    /api/v1/comments/:id                更新评论
DELETE /api/v1/comments/:id                删除评论
```

#### 用户 (Users)

```
GET    /api/v1/users/:id          获取用户信息
PUT    /api/v1/users/:id          更新用户信息
GET    /api/v1/users/:id/stats    获取用户统计
GET    /api/v1/users/:id/tasks    获取用户任务
```

#### 组织 (Groups)

```
GET    /api/v1/groups             获取组织列表
POST   /api/v1/groups             创建组织
GET    /api/v1/groups/:id         获取组织详情
PUT    /api/v1/groups/:id         更新组织
DELETE /api/v1/groups/:id         删除组织
POST   /api/v1/groups/:id/members 添加成员
DELETE /api/v1/groups/:id/members/:userId 移除成员
```

---

## 🧪 测试设计

### 测试架构

本项目采用三层测试架构:

1. **单元测试** - 测试单个函数/类
2. **集成测试** - 测试API接口和数据库交互
3. **E2E测试** - 测试完整的用户流程

### 测试覆盖率目标

- 单元测试覆盖率: >80%
- 集成测试覆盖率: >70%
- E2E测试覆盖率: 核心流程100%

### 运行测试

```bash
# 运行所有测试
npm test

# 运行并监视
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

---

## 📦 部署设计

### Docker 部署

#### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: taskmanager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./src/backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/taskmanager
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./src/frontend
    ports:
      - "3001:3001"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### CI/CD 流程

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: docker build -t taskmanager .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker-compose up -d
```

---

## 📝 监控和日志

### 日志管理

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 性能监控

```typescript
// API 响应时间监控
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

---

**文档版本**: 1.0
**最后更新**: 2026-04-03
**维护者**: 白晶晶
