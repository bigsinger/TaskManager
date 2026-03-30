module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],

  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/config/**',
    '!src/migrations/**',
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
  ],

  // 覆盖率输出目录
  coverageDirectory: 'coverage',

  // 模块路径别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 测试超时时间
  testTimeout: 10000,

  // 并行测试
  maxWorkers: '50%',

  // 详细输出
  verbose: true,

  // 测试设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 全局变量
  globals: {
    'test-jest': true,
  },
};
