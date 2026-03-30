// 测试环境设置
require('dotenv').config({ path: '.env.test' });

// 设置测试数据库
process.env.DB_NAME = process.env.DB_NAME || 'task_manager_test';
process.env.NODE_ENV = 'test';

// 全局测试超时
jest.setTimeout(10000);

// 在所有测试之前执行
beforeAll(async () => {
  console.log('Starting test suite...');
});

// 在所有测试之后执行
afterAll(async () => {
  console.log('Test suite completed.');
});

// 在每个测试之前执行
beforeEach(() => {
  // 可以在这里添加每个测试前的设置
});

// 在每个测试之后执行
afterEach(() => {
  // 可以在这里添加每个测试后的清理
});
