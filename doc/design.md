# TaskManager v1.0 设计开发文档

**项目**: TaskManager 企业级任务管理系统
**版本**: v1.0
**创建日期**: 2026-03-30
**最后更新**: 2026-03-30
**维护人**: 白晶晶

---

## 系统架构

### 整体架构

TaskManager 采用前后端分离架构，前端使用纯 HTML/CSS/JavaScript，后端使用 Node.js + Express + TypeScript + Prisma。

```
┌─────────────────────────────────────────────────────────┐
│                        前端层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  index.html  │  │   app.js     │  │  style.css   │  │
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
│  │   SQLite     │  │  LocalStorage│  │   Memory     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 前端架构

前端采用模块化设计，主要模块包括：

1. **UI 模块**
   - 任务列表渲染
   - 任务表单渲染
   - 标签云渲染
   - 分页渲染

2. **交互模块**
   - 任务创建
   - 任务编辑
   - 任务删除
   - 任务选中

3. **筛选模块**
   - 状态筛选
   - 标签筛选
   - 分页筛选

4. **设置模块**
   - 主题设置
   - 语言设置
   - 副标题设置
   - 每页数量设置

5. **数据模块**
   - 数据获取
   - 数据更新
   - 数据删除
   - 数据缓存

### 后端架构

后端采用分层架构，遵循 DDD（领域驱动设计）原则：

1. **适配器层（Adapters）**
   - 控制器（Controllers）
   - 路由（Routes）
   - 中间件（Middleware）

2. **应用层（Application）**
   - 用例（Use Cases）
   - 服务（Services）
   - DTO（Data Transfer Objects）

3. **领域层（Domain）**
   - 实体（Entities）
   - 值对象（Value Objects）
   - 仓储接口（Repository Interfaces）

4. **基础设施层（Infrastructure）**
   - 仓储实现（Repository Implementations）
   - 数据库连接（Database Connection）
   - 缓存服务（Cache Service）
   - 日志服务（Logger Service）
   - 安全服务（Security Service）

---

## 数据库设计

### 数据库选择

使用 SQLite 作为数据库，原因：
- 轻量级，无需额外安装
- 适合小型项目
- 易于部署和维护
- 支持事务

### 数据表设计

#### Task 表

```sql
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT
);
```

**字段说明**：
- `id`: 任务ID，UUID
- `title`: 任务标题
- `description`: 任务描述
- `status`: 任务状态（pending/in-progress/completed）
- `tags`: 任务标签，JSON 字符串
- `createdAt`: 创建时间
- `updatedAt`: 更新时间
- `createdById`: 创建者ID（可选）
- `updatedById`: 更新者ID（可选）

#### User 表

```sql
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
```

**字段说明**：
- `id`: 用户ID，UUID
- `email`: 邮箱
- `password`: 密码（加密）
- `role`: 角色（admin/user）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 索引设计

```sql
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");
CREATE INDEX "User_email_idx" ON "User"("email");
```

---

## API 设计

### RESTful API 规范

#### 基础 URL
```
http://localhost:3000/api
```

#### 通用响应格式

**成功响应**：
```json
{
  "tasks": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

**错误响应**：
```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

### API 端点

#### 1. 获取任务列表

**请求**：
```
GET /api/tasks?page=1&limit=20&status=pending&tags=work
```

**响应**：
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "pending",
      "tags": ["work", "urgent"],
      "createdAt": "2026-03-30T10:00:00Z",
      "updatedAt": "2026-03-30T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

#### 2. 获取单个任务

**请求**：
```
GET /api/tasks/:id
```

**响应**：
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "tags": ["work", "urgent"],
  "createdAt": "2026-03-30T10:00:00Z",
  "updatedAt": "2026-03-30T10:00:00Z"
}
```

#### 3. 创建任务

**请求**：
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "tags": ["work", "urgent"]
}
```

**响应**：
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "tags": ["work", "urgent"],
  "createdAt": "2026-03-30T10:00:00Z",
  "updatedAt": "2026-03-30T10:00:00Z"
}
```

#### 4. 更新任务

**请求**：
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "tags": ["work"]
}
```

**响应**：
```json
{
  "id": "uuid",
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "tags": ["work"],
  "createdAt": "2026-03-30T10:00:00Z",
  "updatedAt": "2026-03-30T11:00:00Z"
}
```

#### 5. 删除任务

**请求**：
```
DELETE /api/tasks/:id
```

**响应**：
```json
{
  "message": "Task deleted successfully"
}
```

---

## 前端设计

### 页面结构

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header>
            <div class="header-title">
                <h1>Task Manager</h1>
                <p class="subtitle">My Tasks</p>
            </div>
            <div class="header-actions">
                <!-- Settings -->
                <div class="settings">
                    <select id="theme-select">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                    </select>
                    <select id="language-select">
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                    </select>
                    <button id="settings-btn">Settings</button>
                </div>
                <!-- Add Task Button -->
                <button class="btn btn-primary" id="add-task-btn">Add Task</button>
            </div>
        </header>

        <!-- Filter Buttons -->
        <div class="filter-buttons">
            <button class="filter-btn" data-status="pending">Pending</button>
            <button class="filter-btn" data-status="in-progress">In Progress</button>
            <button class="filter-btn" data-status="completed">Completed</button>
        </div>

        <!-- Tag Cloud -->
        <div class="tag-cloud-section">
            <h3>Tags</h3>
            <div class="tag-cloud">
                <!-- Tag items will be rendered here -->
            </div>
        </div>

        <!-- Task List -->
        <div class="task-list">
            <!-- Task items will be rendered here -->
        </div>

        <!-- Pagination -->
        <div class="pagination">
            <div class="pagination-controls">
                <button class="pagination-btn" id="first-page">First</button>
                <button class="pagination-btn" id="prev-page">Prev</button>
                <div class="pagination-pages">
                    <!-- Page numbers will be rendered here -->
                </div>
                <button class="pagination-btn" id="next-page">Next</button>
                <button class="pagination-btn" id="last-page">Last</button>
            </div>
            <div class="pagination-info">
                <span id="pagination-info">1-20 of 100</span>
                <select id="page-size-select">
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Task Form Modal -->
    <div class="modal" id="task-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="form-title">New Task</h2>
                <button class="close-btn" id="close-modal">&times;</button>
            </div>
            <form id="task-form">
                <input type="hidden" id="task-id">
                <div class="form-group">
                    <label for="task-title">Title</label>
                    <input type="text" id="task-title" required>
                </div>
                <div class="form-group">
                    <label for="task-description">Description</label>
                    <textarea id="task-description"></textarea>
                </div>
                <div class="form-group">
                    <label for="task-status">Status</label>
                    <select id="task-status">
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tags-input">Tags</label>
                    <div class="tags-input-container">
                        <div class="tags-display">
                            <!-- Tag items will be rendered here -->
                        </div>
                        <input type="text" id="tags-input" placeholder="Press Enter to add tag">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Save</button>
            </form>
        </div>
    </div>

    <!-- Settings Modal -->
    <div class="modal" id="settings-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Settings</h2>
                <button class="close-btn" id="close-settings">&times;</button>
            </div>
            <form id="settings-form">
                <div class="form-group">
                    <label for="subtitle-input">Subtitle</label>
                    <input type="text" id="subtitle-input">
                </div>
                <button type="submit" class="btn btn-primary">Save</button>
            </form>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

### 样式设计

#### CSS 变量

```css
:root {
    --bg-gradient-start: #667eea;
    --bg-gradient-end: #764ba2;
    --container-bg: white;
    --text-color: #333;
    --border-color: #eee;
    --btn-primary-bg: #667eea;
    --btn-primary-hover: #5568d3;
    --btn-secondary-bg: #6c757d;
    --btn-secondary-hover: #5a6268;
    --btn-danger-bg: #dc3545;
    --btn-danger-hover: #c82333;
    --task-bg: #f8f9fa;
    --task-hover-shadow: rgba(0, 0, 0, 0.1);
    --task-completed-bg: #e9ecef;
    --task-title-color: #333;
    --task-meta-color: #6c757d;
    --task-description-color: #666;
    --status-badge-bg: #6c757d;
    --status-badge-text: white;
    --modal-bg: white;
    --close-color: #aaa;
    --close-hover: #000;
    --form-label-color: #333;
    --form-border-color: #ddd;
    --empty-state-color: #6c757d;
    --loading-color: #667eea;
}

[data-theme="dark"] {
    --bg-gradient-start: #1a1a2e;
    --bg-gradient-end: #16213e;
    --container-bg: #1e1e2e;
    --text-color: #e0e0e0;
    --border-color: #333;
    --btn-primary-bg: #667eea;
    --btn-primary-hover: #5568d3;
    --btn-secondary-bg: #4a4a5a;
    --btn-secondary-hover: #3a3a4a;
    --btn-danger-bg: #dc3545;
    --btn-danger-hover: #c82333;
    --task-bg: #2a2a3a;
    --task-hover-shadow: rgba(0, 0, 0, 0.3);
    --task-completed-bg: #1a1a2e;
    --task-title-color: #e0e0e0;
    --task-meta-color: #a0a0a0;
    --task-description-color: #b0b0b0;
    --status-badge-bg: #4a4a5a;
    --status-badge-text: #e0e0e0;
    --modal-bg: #1e1e2e;
    --close-color: #a0a0a0;
    --close-hover: #e0e0e0;
    --form-label-color: #e0e0e0;
    --form-border-color: #444;
    --empty-state-color: #a0a0a0;
    --loading-color: #667eea;
}
```

#### 响应式设计

```css
@media (max-width: 768px) {
    .pagination {
        flex-direction: column;
        align-items: stretch;
    }
    
    .pagination-controls {
        justify-content: center;
    }
    
    .pagination-size {
        justify-content: center;
    }
    
    .header-actions {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filter-buttons {
        justify-content: center;
    }
    
    .tag-cloud-section {
        padding: 15px;
    }
    
    .tag-cloud {
        gap: 8px;
    }
}
```

### JavaScript 设计

#### 模块划分

```javascript
// API 模块
const API_URL = `${currentOrigin.replace(':3001', ':3000')}/api/tasks`;

// 状态管理
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'system';
let currentSubtitle = localStorage.getItem('subtitle') || t('subtitle');
let selectedFilters = new Set();
let selectedTags = new Set();
let currentPage = 1;
let pageSize = parseInt(localStorage.getItem('pageSize') || '20');
let totalTasks = 0;
let totalPages = 0;
let allTasks = [];
let currentTags = [];
let selectedTaskId = null;

// API 函数
async function fetchTasks() { }
async function createTask(taskData) { }
async function updateTask(taskId, taskData) { }
async function deleteTask(taskId) { }

// 渲染函数
function renderTasks(tasks) { }
function renderTagCloud() { }
function renderPagination() { }

// 交互函数
function handleFormSubmit(e) { }
function editTask(taskId) { }
function selectTask(taskId) { }
function toggleTagFilter(tag) { }

// 筛选函数
function filterTasks(tasks) { }

// 设置函数
function applyTheme(theme) { }
function applyLanguage(language) { }
```

---

## 后端设计

### 分层架构

#### 1. 适配器层（Adapters）

**控制器（Controllers）**：
- `TaskController.ts`: 任务控制器
- `AuthController.ts`: 认证控制器

**路由（Routes）**：
- `task.routes.ts`: 任务路由
- `auth.routes.ts`: 认证路由

**中间件（Middleware）**：
- `auth.middleware.ts`: 认证中间件
- `cache.middleware.ts`: 缓存中间件
- `error.middleware.ts`: 错误处理中间件
- `validation.middleware.ts`: 验证中间件

#### 2. 应用层（Application）

**用例（Use Cases）**：
- `CreateTask.ts`: 创建任务用例
- `UpdateTask.ts`: 更新任务用例
- `DeleteTask.ts`: 删除任务用例
- `GetTaskById.ts`: 获取任务用例
- `GetAllTasks.ts`: 获取所有任务用例

**服务（Services）**：
- `TaskService.ts`: 任务服务

**DTO（Data Transfer Objects）**：
- `CreateTaskDto.ts`: 创建任务DTO
- `UpdateTaskDto.ts`: 更新任务DTO
- `TaskResponseDto.ts`: 任务响应DTO

#### 3. 领域层（Domain）

**实体（Entities）**：
- `Task.ts`: 任务实体
- `User.ts`: 用户实体

**值对象（Value Objects）**：
- `TaskStatus.ts`: 任务状态值对象
- `TaskPriority.ts`: 任务优先级值对象
- `UserRole.ts`: 用户角色值对象

**仓储接口（Repository Interfaces）**：
- `ITaskRepository.ts`: 任务仓储接口
- `IUserRepository.ts`: 用户仓储接口

#### 4. 基础设施层（Infrastructure）

**仓储实现（Repository Implementations）**：
- `TaskRepository.ts`: 任务仓储实现
- `UserRepository.ts`: 用户仓储实现

**数据库连接（Database Connection）**：
- `connection.ts`: 数据库连接

**缓存服务（Cache Service）**：
- `RedisCacheService.ts`: Redis 缓存服务

**日志服务（Logger Service）**：
- `WinstonLogger.ts`: Winston 日志服务

**安全服务（Security Service）**：
- `JwtAuthenticationService.ts`: JWT 认证服务
- `PasswordService.ts`: 密码服务

---

## 安全设计

### 1. 输入验证

#### 前端验证
```javascript
// 验证任务标题
if (!taskData.title || taskData.title.trim() === '') {
    alert('Title is required');
    return;
}
```

#### 后端验证
```typescript
// 使用验证中间件
app.use(validationMiddleware);
```

### 2. XSS 防护

#### 前端防护
```javascript
// 转义 HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

#### 后端防护
```typescript
// 使用 helmet 中间件
app.use(helmet());
```

### 3. CSRF 防护

#### 后端防护
```typescript
// 使用 csurf 中间件
app.use(csurf({ cookie: true }));
```

### 4. SQL 注入防护

#### 后端防护
```typescript
// 使用 Prisma ORM，自动防护 SQL 注入
const tasks = await prisma.task.findMany({
    where: { status: 'pending' }
});
```

---

## 性能优化

### 1. 前端优化

#### 1.1 减少请求
- 使用本地数组更新，避免重新加载
- 使用 LocalStorage 缓存设置

#### 1.2 优化渲染
- 使用虚拟滚动（大量数据时）
- 使用防抖和节流

#### 1.3 优化动画
- 使用 CSS 动画
- 使用 transform 和 opacity

### 2. 后端优化

#### 2.1 数据库优化
- 使用索引
- 使用分页查询
- 使用缓存

#### 2.2 API 优化
- 使用压缩
- 使用缓存
- 使用 CDN

---

## 部署设计

### 1. 前端部署

#### 1.1 静态文件服务
```bash
# 使用 http-server
npx http-server -p 3001
```

#### 1.2 反向代理
```nginx
server {
    listen 80;
    server_name taskmanager.example.com;

    location / {
        proxy_pass http://localhost:3001;
    }
}
```

### 2. 后端部署

#### 2.1 Node.js 服务
```bash
# 启动服务
npm run dev
```

#### 2.2 环境变量
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
```

#### 2.3 进程管理
```bash
# 使用 PM2
pm2 start dist/server.js
```

---

## 测试设计

### 1. 单元测试

#### 前端测试
```javascript
// 测试筛选函数
describe('filterTasks', () => {
    it('should filter tasks by status', () => {
        const tasks = [
            { id: '1', status: 'pending' },
            { id: '2', status: 'completed' }
        ];
        const filters = new Set(['pending']);
        const result = filterTasks(tasks, filters);
        expect(result.length).toBe(1);
    });
});
```

#### 后端测试
```typescript
// 测试任务服务
describe('TaskService', () => {
    it('should create a task', async () => {
        const task = await taskService.createTask({
            title: 'Test task',
            status: 'pending'
        });
        expect(task).toBeDefined();
        expect(task.title).toBe('Test task');
    });
});
```

### 2. 集成测试

#### API 测试
```typescript
// 测试 API 端点
describe('Task API', () => {
    it('should create a task', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test task' });
        expect(response.status).toBe(201);
    });
});
```

### 3. 端到端测试

#### E2E 测试
```javascript
// 测试用户流程
describe('User Flow', () => {
    it('should create and delete a task', async () => {
        await page.goto('http://localhost:3001');
        await page.click('#add-task-btn');
        await page.fill('#task-title', 'Test task');
        await page.click('button[type="submit"]');
        await page.waitForSelector('.task-item');
        await page.click('.btn-danger');
        await page.waitForSelector('.empty-state');
    });
});
```

---

## 监控设计

### 1. 日志监控

#### 前端日志
```javascript
// 使用 console.log
console.log('Task created:', task);
```

#### 后端日志
```typescript
// 使用 Winston
logger.info('Task created', { taskId: task.id });
```

### 2. 性能监控

#### 前端性能
```javascript
// 使用 Performance API
const perfData = performance.getEntriesByType('navigation')[0];
console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
```

#### 后端性能
```typescript
// 使用中间件
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

## 文档设计

### 1. API 文档

使用 Swagger/OpenAPI 规范：
```yaml
openapi: 3.0.0
info:
  title: TaskManager API
  version: 1.0.0
paths:
  /api/tasks:
    get:
      summary: Get all tasks
      responses:
        '200':
          description: Successful response
    post:
      summary: Create a task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
      responses:
        '201':
          description: Task created
```

### 2. 用户文档

提供详细的使用说明：
- 如何安装
- 如何配置
- 如何使用
- 常见问题

---

## 总结

TaskManager v1.0 采用前后端分离架构，前端使用纯 HTML/CSS/JavaScript，后端使用 Node.js + Express + TypeScript + Prisma。系统设计遵循 DDD 原则，采用分层架构，具有良好的可维护性和可扩展性。

**文档版本**: 1.0
