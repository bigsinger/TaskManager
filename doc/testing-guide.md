# TaskManager 测试文档

## 测试架构

本项目采用三层测试架构：

1. **单元测试** - 测试单个函数/类
2. **集成测试** - 测试API接口和数据库交互
3. **E2E测试** - 测试完整的用户流程

## 测试覆盖率目标

- 单元测试覆盖率: >80%
- 集成测试覆盖率: >70%
- E2E测试覆盖率: 核心流程100%

## 运行测试

### 单元测试

```bash
# 运行所有单元测试
npm test

# 运行并监视
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 集成测试

```bash
# 运行集成测试
npm test -- --testPathPattern=integration
```

### E2E测试

```bash
# 安装Playwright浏览器
npx playwright install

# 运行E2E测试
npm run test:e2e

# 运行特定浏览器测试
npx playwright test --project=chromium

# 查看测试报告
npx playwright show-report
```

## 测试文件结构

```
src/__tests__/
├── setup.ts              # 测试配置和初始化
├── unit/                 # 单元测试
│   ├── TaskService.test.ts
│   ├── AuthService.test.ts
│   └── ...
├── integration/          # 集成测试
│   ├── TaskAPI.test.ts
│   └── AuthAPI.test.ts
└── e2e/                  # E2E测试
    └── task-management.spec.ts
```

## 编写测试

### 单元测试示例

```typescript
import { TaskService } from '../../application/services/TaskService';

describe('TaskService', () => {
  it('should create a task', async () => {
    const taskData = { title: 'Test', status: 'PENDING' };
    const result = await taskService.createTask(taskData, 'user-1');
    expect(result.title).toBe('Test');
  });
});
```

### 集成测试示例

```typescript
import request from 'supertest';

describe('Task API', () => {
  it('should create task via API', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test' })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

### E2E测试示例

```typescript
import { test, expect } from '@playwright/test';

test('should create a task', async ({ page }) => {
  await page.click('#show-form-btn');
  await page.fill('#task-title', 'Test Task');
  await page.click('#save-task-btn');
  
  await expect(page.locator('.task-item')).toContainText('Test Task');
});
```

## 持续集成

测试会在以下情况自动运行：

1. 每次提交前（pre-commit hook）
2. 每次推送时（CI/CD pipeline）
3. 每日定时运行（nightly build）

## 测试数据

测试使用独立的SQLite数据库（test.db），每次测试前自动清理。

## 最佳实践

1. **独立性**: 每个测试应该独立运行
2. **可重复性**: 测试结果应该可重复
3. **快速性**: 测试应该快速执行
4. **清晰性**: 测试用例应该清晰易读
5. **覆盖率**: 保持高代码覆盖率

## 故障排除

### 测试数据库锁定

```bash
# 删除测试数据库
rm prisma/test.db

# 重新生成Prisma客户端
npx prisma generate
```

### E2E测试失败

```bash
# 以有头模式运行（可见浏览器）
npx playwright test --headed

# 调试特定测试
npx playwright test --debug
```
