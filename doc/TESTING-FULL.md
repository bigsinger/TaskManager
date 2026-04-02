# TaskManager 完整测试文档

> **项目**: TaskManager 企业级任务管理系统
> **当前版本**: v2.2.0
> **创建日期**: 2026-03-30
> **最后更新**: 2026-04-03
> **维护人**: 白晶晶

---

## 📋 文档概述

本文档整合了 TaskManager 项目的所有测试相关内容,包括:
- 测试架构设计
- 单元测试
- 集成测试
- E2E测试
- 测试覆盖率
- CI/CD测试流程

---

## 🧪 测试架构

### 测试分层

本项目采用三层测试架构:

1. **单元测试** - 测试单个函数/类
2. **集成测试** - 测试API接口和数据库交互
3. **E2E测试** - 测试完整的用户流程

### 测试文件结构

```
TaskManager/
├── src/
│   ├── backend/
│   │   ├── __tests__/
│   │   │   ├── setup.ts              # 测试配置和初始化
│   │   │   ├── unit/                 # 单元测试
│   │   │   │   ├── services/
│   │   │   │   │   ├── TaskService.test.ts
│   │   │   │   │   ├── AuthService.test.ts
│   │   │   │   │   └── ContextService.test.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── validators.test.ts
│   │   │   │   │   └── formatters.test.ts
│   │   │   │   └── middleware/
│   │   │   │       ├── auth.test.ts
│   │   │   │       └── validation.test.ts
│   │   │   ├── integration/          # 集成测试
│   │   │   │   ├── TaskAPI.test.ts
│   │   │   │   ├── AuthAPI.test.ts
│   │   │   │   └── ContextAPI.test.ts
│   │   │   └── e2e/                  # E2E测试
│   │   │       ├── task-management.spec.ts
│   │   │       ├── user-auth.spec.ts
│   │   │       └── context-management.spec.ts
│   │   └── vitest.config.ts
│   └── frontend/
│       ├── __tests__/
│       │   ├── setup.ts
│       │   ├── unit/
│       │   │   ├── components/
│       │   │   │   ├── TaskCard.test.tsx
│       │   │   │   ├── TaskList.test.tsx
│       │   │   │   └── ContextSwitcher.test.tsx
│       │   │   ├── hooks/
│       │   │   │   ├── useTaskStore.test.ts
│       │   │   │   └── useUserStore.test.ts
│       │   │   └── utils/
│       │   │       ├── formatters.test.ts
│       │   │       └── validators.test.ts
│       │   ├── integration/
│       │   │   └── api.test.ts
│       │   └── e2e/
│       │       ├── task-creation.spec.ts
│       │       ├── task-editing.spec.ts
│       │       └── task-deletion.spec.ts
│       └── vitest.config.ts
└── tests/
    └── e2e/
        ├── auth.spec.ts
        ├── tasks.spec.ts
        └── contexts.spec.ts
```

---

## 🎯 测试覆盖率目标

| 测试类型 | 目标覆盖率 | 当前覆盖率 |
|---------|-----------|-----------|
| 单元测试 | >80% | 待统计 |
| 集成测试 | >70% | 待统计 |
| E2E测试 | 核心流程100% | 待统计 |

---

## 🚀 运行测试

### 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或分别安装
cd src/backend && npm install
cd src/frontend && npm install
```

### 运行所有测试

```bash
# 运行所有测试
npm test

# 运行并监视
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 运行后端测试

```bash
cd src/backend

# 运行所有后端测试
npm test

# 运行单元测试
npm test -- --testPathPattern=unit

# 运行集成测试
npm test -- --testPathPattern=integration

# 运行 E2E 测试
npm test -- --testPathPattern=e2e
```

### 运行前端测试

```bash
cd src/frontend

# 运行所有前端测试
npm test

# 运行单元测试
npm test -- --testPathPattern=unit

# 运行集成测试
npm test -- --testPathPattern=integration

# 运行 E2E 测试
npm test -- --testPathPattern=e2e
```

### 运行 E2E 测试

```bash
# 安装 Playwright 浏览器
npx playwright install

# 运行 E2E 测试
npm run test:e2e

# 运行特定浏览器测试
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# 查看测试报告
npx playwright show-report

# 以有头模式运行（可见浏览器）
npx playwright test --headed

# 调试特定测试
npx playwright test --debug
```

---

## 📝 编写测试

### 单元测试示例

#### 后端单元测试

```typescript
// src/backend/__tests__/unit/services/TaskService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '../../../application/services/TaskService';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockRepository: ITaskRepository;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any;
    taskService = new TaskService(mockRepository);
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending'
      };

      const mockTask = {
        id: '1',
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRepository.create.mockResolvedValue(mockTask);

      const result = await taskService.createTask(taskData, 'user-1');

      expect(result).toEqual(mockTask);
      expect(mockRepository.create).toHaveBeenCalledWith(taskData, 'user-1');
    });

    it('should throw error if title is empty', async () => {
      const taskData = {
        title: '',
        description: 'Test Description',
        status: 'pending'
      };

      await expect(taskService.createTask(taskData, 'user-1'))
        .rejects.toThrow('Title is required');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const taskId = '1';
      const updateData = {
        title: 'Updated Task',
        status: 'in-progress'
      };

      const existingTask = {
        id: taskId,
        title: 'Original Task',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedTask = {
        ...existingTask,
        ...updateData,
        updatedAt: new Date()
      };

      mockRepository.findById.mockResolvedValue(existingTask);
      mockRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, updateData, 'user-1');

      expect(result).toEqual(updatedTask);
      expect(mockRepository.update).toHaveBeenCalledWith(taskId, updateData, 'user-1');
    });

    it('should throw error if task not found', async () => {
      const taskId = 'non-existent';
      const updateData = { title: 'Updated Task' };

      mockRepository.findById.mockResolvedValue(null);

      await expect(taskService.updateTask(taskId, updateData, 'user-1'))
        .rejects.toThrow('Task not found');
    });
  });
});
```

#### 前端单元测试

```typescript
// src/frontend/__tests__/unit/components/TaskCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../../../components/TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    createdAt: '2026-03-30T10:00:00Z',
    tags: ['work', 'urgent']
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  it('should render task title', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render task description', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onUpdate when edit button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnUpdate).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should render tags', () => {
    render(
      <TaskCard
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });
});
```

### 集成测试示例

#### 后端集成测试

```typescript
// src/backend/__tests__/integration/TaskAPI.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../infrastructure/database';

describe('Task API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User'
      }
    });
    userId = user.id;

    // 生成认证 token
    authToken = `Bearer ${generateToken(userId)}`;
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.task.deleteMany({
      where: { createdById: userId }
    });
    await prisma.user.delete({
      where: { id: userId }
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', authToken)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Task');
      expect(response.body.status).toBe('pending');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', authToken)
        .expect(200);

      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', authToken)
        .expect(200);

      response.body.tasks.forEach((task: any) => {
        expect(task.status).toBe('pending');
      });
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a task by id', async () => {
      // 先创建一个任务
      const createdTask = await request(app)
        .post('/api/tasks')
        .set('Authorization', authToken)
        .send({
          title: 'Test Task',
          status: 'pending'
        });

      const response = await request(app)
        .get(`/api/tasks/${createdTask.body.id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.id).toBe(createdTask.body.id);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      // 先创建一个任务
      const createdTask = await request(app)
        .post('/api/tasks')
        .set('Authorization', authToken)
        .send({
          title: 'Original Title',
          status: 'pending'
        });

      const response = await request(app)
        .put(`/api/tasks/${createdTask.body.id}`)
        .set('Authorization', authToken)
        .send({
          title: 'Updated Title',
          status: 'in-progress'
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.status).toBe('in-progress');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      // 先创建一个任务
      const createdTask = await request(app)
        .post('/api/tasks')
        .set('Authorization', authToken)
        .send({
          title: 'Test Task',
          status: 'pending'
        });

      const response = await request(app)
        .delete(`/api/tasks/${createdTask.body.id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      // 验证任务已被删除
      const getResponse = await request(app)
        .get(`/api/tasks/${createdTask.body.id}`)
        .set('Authorization', authToken)
        .expect(404);
    });
  });
});
```

### E2E测试示例

```typescript
// tests/e2e/tasks.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:3001/login');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tasks');
  });

  test('should create a new task', async ({ page }) => {
    // 点击添加任务按钮
    await page.click('#add-task-btn');

    // 填写任务表单
    await page.fill('#task-title', 'Test Task');
    await page.fill('#task-description', 'Test Description');
    await page.selectOption('#task-status', 'pending');

    // 保存任务
    await page.click('button[type="submit"]');

    // 验证任务已创建
    await expect(page.locator('.task-item')).toContainText('Test Task');
  });

  test('should edit an existing task', async ({ page }) => {
    // 先创建一个任务
    await page.click('#add-task-btn');
    await page.fill('#task-title', 'Original Task');
    await page.click('button[type="submit"]');

    // 点击编辑按钮
    await page.click('.task-item .edit-btn');

    // 修改任务
    await page.fill('#task-title', 'Updated Task');
    await page.click('button[type="submit"]');

    // 验证任务已更新
    await expect(page.locator('.task-item')).toContainText('Updated Task');
  });

  test('should delete a task', async ({ page }) => {
    // 先创建一个任务
    await page.click('#add-task-btn');
    await page.fill('#task-title', 'Task to Delete');
    await page.click('button[type="submit"]');

    // 点击删除按钮
    await page.click('.task-item .delete-btn');

    // 确认删除
    await page.click('.confirm-delete-btn');

    // 验证任务已删除
    await expect(page.locator('.task-item')).not.toContainText('Task to Delete');
  });

  test('should filter tasks by status', async ({ page }) => {
    // 创建不同状态的任务
    await page.click('#add-task-btn');
    await page.fill('#task-title', 'Pending Task');
    await page.selectOption('#task-status', 'pending');
    await page.click('button[type="submit"]');

    await page.click('#add-task-btn');
    await page.fill('#task-title', 'Completed Task');
    await page.selectOption('#task-status', 'completed');
    await page.click('button[type="submit"]');

    // 筛选待处理任务
    await page.click('.filter-btn[data-status="pending"]');

    // 验证只显示待处理任务
    await expect(page.locator('.task-item')).toContainText('Pending Task');
    await expect(page.locator('.task-item')).not.toContainText('Completed Task');
  });

  test('should search tasks', async ({ page }) => {
    // 创建多个任务
    await page.click('#add-task-btn');
    await page.fill('#task-title', 'Work Task');
    await page.click('button[type="submit"]');

    await page.click('#add-task-btn');
    await page.fill('#task-title', 'Personal Task');
    await page.click('button[type="submit"]');

    // 搜索任务
    await page.fill('#search-input', 'Work');

    // 验证搜索结果
    await expect(page.locator('.task-item')).toContainText('Work Task');
    await expect(page.locator('.task-item')).not.toContainText('Personal Task');
  });
});
```

---

## 🔄 持续集成

### GitHub Actions 配置

测试会在以下情况自动运行:

1. 每次提交前 (pre-commit hook)
2. 每次推送时 (CI/CD pipeline)
3. 每日定时运行 (nightly build)

### CI/CD 工作流

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
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm run install:all

      - name: Run unit tests
        run: |
          cd src/backend && npm test -- --testPathPattern=unit
          cd src/frontend && npm test -- --testPathPattern=unit

      - name: Run integration tests
        run: |
          cd src/backend && npm test -- --testPathPattern=integration
          cd src/frontend && npm test -- --testPathPattern=integration

      - name: Run E2E tests
        run: |
          npx playwright install
          npm run test:e2e

      - name: Generate coverage report
        run: |
          npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📊 测试数据

### 测试数据库

测试使用独立的 PostgreSQL 数据库 (test_db),每次测试前自动清理。

### 测试数据清理

```typescript
// src/backend/__tests__/setup.ts
import { prisma } from '../../infrastructure/database';

export async function setupTestDatabase() {
  // 清理所有测试数据
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.context.deleteMany();
  await prisma.group.deleteMany();
}

export async function teardownTestDatabase() {
  // 清理所有测试数据
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.context.deleteMany();
  await prisma.group.deleteMany();

  // 关闭数据库连接
  await prisma.$disconnect();
}
```

---

## ✅ 最佳实践

### 1. 测试独立性

每个测试应该独立运行,不依赖其他测试的状态。

```typescript
// ❌ 错误示例
describe('TaskService', () => {
  let taskId: string;

  it('should create a task', async () => {
    const task = await taskService.createTask({ title: 'Test' });
    taskId = task.id; // 依赖前一个测试
  });

  it('should update the task', async () => {
    await taskService.updateTask(taskId, { title: 'Updated' }); // 依赖前一个测试
  });
});

// ✅ 正确示例
describe('TaskService', () => {
  it('should create a task', async () => {
    const task = await taskService.createTask({ title: 'Test' });
    expect(task).toBeDefined();
  });

  it('should update a task', async () => {
    const task = await taskService.createTask({ title: 'Test' });
    const updated = await taskService.updateTask(task.id, { title: 'Updated' });
    expect(updated.title).toBe('Updated');
  });
});
```

### 2. 测试可重复性

测试结果应该可重复,不受外部因素影响。

```typescript
// ❌ 错误示例
it('should return current date', () => {
  const result = getCurrentDate();
  expect(result).toBe(new Date().toISOString()); // 每次运行结果不同
});

// ✅ 正确示例
it('should return current date', () => {
  const mockDate = new Date('2026-03-30T10:00:00Z');
  vi.useFakeTimers().setSystemTime(mockDate);

  const result = getCurrentDate();
  expect(result).toBe('2026-03-30T10:00:00.000Z');

  vi.useRealTimers();
});
```

### 3. 测试快速性

测试应该快速执行,避免不必要的等待。

```typescript
// ❌ 错误示例
it('should create a task', async () => {
  await createTask({ title: 'Test' });
  await new Promise(resolve => setTimeout(resolve, 5000)); // 不必要的等待
  const task = await getTask('1');
  expect(task).toBeDefined();
});

// ✅ 正确示例
it('should create a task', async () => {
  await createTask({ title: 'Test' });
  const task = await getTask('1');
  expect(task).toBeDefined();
});
```

### 4. 测试清晰性

测试用例应该清晰易读,描述性强。

```typescript
// ❌ 错误示例
it('should work', async () => {
  const result = await service.doSomething();
  expect(result).toBe(true);
});

// ✅ 正确示例
it('should create a task when valid data is provided', async () => {
  const taskData = {
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending'
  };

  const result = await taskService.createTask(taskData, 'user-1');

  expect(result).toBeDefined();
  expect(result.title).toBe('Test Task');
  expect(result.status).toBe('pending');
});
```

### 5. 保持高覆盖率

保持高代码覆盖率,但不要为了覆盖率而写无意义的测试。

```typescript
// ❌ 错误示例
it('should return true', () => {
  expect(true).toBe(true); // 无意义的测试
});

// ✅ 正确示例
it('should validate email format', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid-email')).toBe(false);
  expect(validateEmail('')).toBe(false);
});
```

---

## 🔧 故障排除

### 测试数据库锁定

```bash
# 删除测试数据库
rm prisma/test.db

# 重新生成 Prisma Client
npx prisma generate
```

### E2E测试失败

```bash
# 以有头模式运行（可见浏览器）
npx playwright test --headed

# 调试特定测试
npx playwright test --debug

# 查看测试报告
npx playwright show-report
```

### 测试超时

```typescript
// 增加测试超时时间
test('should complete long operation', async () => {
  // ...
}, 10000); // 10秒超时
```

---

## 📈 测试报告

### 生成覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 查看覆盖率报告
open coverage/index.html
```

### 查看测试报告

```bash
# 查看 Playwright 测试报告
npx playwright show-report
```

---

**文档版本**: 1.0
**最后更新**: 2026-04-03
**维护者**: 白晶晶
