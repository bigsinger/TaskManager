/**
 * E2E Tests - Task Management Flow
 */
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login.html');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 等待跳转到主页
    await page.waitForURL('/index.html');
  });

  test('should create a new task', async ({ page }) => {
    // 点击新建任务按钮
    await page.click('#show-form-btn');
    
    // 填写任务表单
    await page.fill('#task-title', 'E2E Test Task');
    await page.fill('#task-description', 'This is an E2E test task');
    await page.selectOption('#task-status', 'PENDING');
    await page.selectOption('#task-priority', 'HIGH');
    
    // 保存任务
    await page.click('#save-task-btn');
    
    // 验证任务已创建
    await expect(page.locator('.task-item')).toContainText('E2E Test Task');
  });

  test('should search tasks', async ({ page }) => {
    // 创建测试任务
    await page.click('#show-form-btn');
    await page.fill('#task-title', 'Searchable Task');
    await page.click('#save-task-btn');
    
    // 搜索任务
    await page.fill('#search-input', 'Searchable');
    await page.press('#search-input', 'Enter');
    
    // 验证搜索结果
    await expect(page.locator('.task-item')).toContainText('Searchable Task');
  });

  test('should filter tasks by status', async ({ page }) => {
    // 点击待处理筛选按钮
    await page.click('[data-status="pending"]');
    
    // 验证只显示待处理任务
    const tasks = await page.locator('.task-item').all();
    for (const task of tasks) {
      await expect(task).toHaveClass(/status-pending/);
    }
  });

  test('should sort tasks', async ({ page }) => {
    // 选择排序方式
    await page.selectOption('#sort-select', 'title:asc');
    
    // 验证任务已按标题排序
    const taskTitles = await page.locator('.task-title').allTextContents();
    const sortedTitles = [...taskTitles].sort();
    expect(taskTitles).toEqual(sortedTitles);
  });

  test('should edit a task', async ({ page }) => {
    // 找到第一个任务的编辑按钮
    const firstTask = page.locator('.task-item').first();
    await firstTask.locator('.btn-edit').click();
    
    // 修改任务标题
    await page.fill('#task-title', 'Updated Task Title');
    await page.click('#save-task-btn');
    
    // 验证任务已更新
    await expect(page.locator('.task-item')).toContainText('Updated Task Title');
  });

  test('should delete a task', async ({ page }) => {
    // 获取当前任务数量
    const initialCount = await page.locator('.task-item').count();
    
    // 删除第一个任务
    const firstTask = page.locator('.task-item').first();
    await firstTask.locator('.btn-delete').click();
    
    // 确认删除
    await page.click('.confirm-delete-btn');
    
    // 验证任务数量减少
    await expect(page.locator('.task-item')).toHaveCount(initialCount - 1);
  });

  test('should export tasks', async ({ page }) => {
    // 点击导出按钮
    await page.click('#export-btn');
    
    // 选择导出格式
    await page.click('text=Export as CSV');
    
    // 验证文件下载（通过监听下载事件）
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export as CSV'),
    ]);
    
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should handle pagination', async ({ page }) => {
    // 如果有多页，测试分页功能
    const nextButton = page.locator('#pagination-next');
    
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      // 验证页面已切换
      await expect(page.locator('.pagination-page.active')).toContainText('2');
    }
  });

  test('should toggle theme', async ({ page }) => {
    // 打开设置
    await page.click('#settings-btn');
    
    // 选择深色主题
    await page.selectOption('#theme-select', 'dark');
    
    // 验证主题已切换
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
  });

  test('should switch language', async ({ page }) => {
    // 打开设置
    await page.click('#settings-btn');
    
    // 选择中文
    await page.selectOption('#language-select', 'zh');
    
    // 验证语言已切换
    await expect(page.locator('h1')).toContainText('任务管理器');
  });
});

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // 清除本地存储中的token
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.clear());
    
    // 尝试访问主页
    await page.goto('/index.html');
    
    // 验证重定向到登录页
    await expect(page).toHaveURL('/login.html');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login.html');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 验证登录成功
    await page.waitForURL('/index.html');
    await expect(page.locator('.user-name')).toContainText('Test User');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login.html');
    
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // 验证错误提示
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // 先登录
    await page.goto('/login.html');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/index.html');
    
    // 点击登出
    await page.click('#logout-btn');
    
    // 验证重定向到登录页
    await expect(page).toHaveURL('/login.html');
  });
});
