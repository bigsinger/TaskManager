# TaskManager

<div align="center">

![TaskManager Logo](https://via.placeholder.com/150?text=TaskManager)

**企业级任务管理系统**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-black)](https://www.prisma.io/)

[功能特性](#功能特性) • [快速开始](#快速开始) • [文档](#文档) • [贡献](#贡献) • [许可证](#许可证)

</div>

---

## 项目简介

TaskManager 是一个企业级任务管理系统，提供简单易用的任务管理界面，支持任务的创建、编辑、删除、查看等基本功能，同时提供了丰富的企业级特性。

### 核心特性

- ✅ **任务管理**：创建、编辑、删除、查看任务
- ✅ **主题切换**：支持浅色、深色、系统主题
- ✅ **多语言支持**：支持英语、中文
- ✅ **状态筛选**：支持多选状态筛选
- ✅ **标签管理**：支持任务标签和标签云
- ✅ **分页功能**：企业级分页导航
- ✅ **响应式设计**：支持移动端和局域网访问
- ✅ **动画效果**：流畅的动画和交互效果

### 技术栈

#### 前端
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- LocalStorage

#### 后端
- Node.js
- Express
- TypeScript
- Prisma
- SQLite

---

## 功能特性

### 任务管理
- 📝 创建任务（标题、描述、状态、标签）
- ✏️ 编辑任务
- 🗑️ 删除任务（渐进式消失动画）
- 👁️ 查看任务列表
- 🎯 任务选中（悬停和选中效果）

### 主题设置
- 🌞 浅色主题
- 🌙 深色主题
- 💻 系统主题
- 💾 主题设置持久化

### 多语言支持
- 🇺🇸 英语
- 🇨🇳 中文
- 💾 语言设置持久化

### 状态筛选
- ⏳ Pending（待处理）
- 🔄 In Progress（进行中）
- ✅ Completed（已完成）
- 🔍 多选筛选
- 🎯 实时过滤

### 标签管理
- 🏷️ 标签输入（Enter 键添加）
- ❌ 标签删除（点击 × 按钮）
- ☁️ 标签云（频率显示）
- 🔍 标签筛选
- 🎯 与状态筛选协同

### 分页功能
- 📄 智能分页（最多5个页码）
- 🔢 每页数量选择（5/10/20/50/100）
- ⏮️ 首页/上一页/下一页/末页
- 📱 响应式设计

### 用户体验
- 🎨 流畅的动画效果
- 🎯 清晰的视觉反馈
- 📱 移动端支持
- 🌐 局域网访问

---

## 快速开始

### 前置条件

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/TaskManager.git
cd TaskManager
```

#### 2. 安装依赖

```bash
# 安装前端依赖
cd src/frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

#### 3. 配置环境变量

```bash
cd src/backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
NODE_ENV=development
```

#### 4. 初始化数据库

```bash
cd src/backend
npx prisma generate
npx prisma migrate dev
```

#### 5. 启动服务

```bash
# 启动后端服务（终端1）
cd src/backend
npm run dev

# 启动前端服务（终端2）
cd src/frontend
npx http-server -p 3001
```

#### 6. 访问系统

打开浏览器，访问：http://localhost:3001

---

## 项目结构

```
TaskManager/
├── src/
│   ├── frontend/          # 前端源代码
│   │   ├── index.html     # 主页面
│   │   ├── app.js         # 前端逻辑
│   │   ├── style.css      # 样式文件
│   │   ├── package.json   # 前端依赖
│   │   └── package-lock.json
│   └── backend/           # 后端源代码
│       ├── src/           # 后端源代码
│       │   ├── server.ts  # 服务器入口
│       │   ├── adapters/  # 适配器层
│       │   ├── application/  # 应用层
│       │   ├── domain/   # 领域层
│       │   ├── infrastructure/  # 基础设施层
│       │   └── types/    # 类型定义
│       ├── prisma/        # 数据库配置
│       ├── package.json   # 后端依赖
│       ├── tsconfig.json  # TypeScript 配置
│       └── .env.example   # 环境变量示例
├── doc/                   # 文档目录
│   ├── requirements.md    # 需求文档
│   ├── design.md          # 设计文档
│   ├── testing.md         # 测试文档
│   ├── deployment.md      # 部署文档
│   └── usage.md           # 使用说明文档
├── .gitignore            # Git 忽略文件
└── README.md             # 项目说明
```

---

## 文档

- [需求文档](doc/requirements.md) - 详细的功能需求和非功能需求
- [设计文档](doc/design.md) - 系统架构、数据库设计、API设计
- [测试文档](doc/testing.md) - 功能测试、兼容性测试、性能测试
- [部署文档](doc/deployment.md) - 部署步骤、生产环境部署、监控和日志
- [使用说明](doc/usage.md) - 功能说明、常见问题、最佳实践

---

## 开发指南

### 前端开发

```bash
cd src/frontend
npx http-server -p 3001
```

### 后端开发

```bash
cd src/backend
npm run dev
```

### 数据库迁移

```bash
cd src/backend

# 创建迁移
npx prisma migrate dev --name migration_name

# 应用迁移
npx prisma migrate deploy

# 重置数据库（慎用）
npx prisma migrate reset
```

### 代码规范

- 使用 ES6+ 语法
- 函数命名使用驼峰命名法
- 变量命名使用驼峰命名法
- 常量命名使用大写下划线
- 添加必要的注释

### Git 规范

- 提交信息使用英文
- 提交信息格式：`类型: 描述`
- 提交类型：
  - `feat`: 新功能
  - `fix`: 修复bug
  - `docs`: 文档更新
  - `style`: 代码格式调整
  - `refactor`: 重构
  - `test`: 测试
  - `chore`: 构建/工具链

---

## 测试

### 功能测试

```bash
# 前端测试（需要实现）
cd src/frontend
npm test

# 后端测试（需要实现）
cd src/backend
npm test
```

### 端到端测试

```bash
# E2E 测试（需要实现）
npm run test:e2e
```

---

## 部署

### 本地部署

参考 [部署文档](doc/deployment.md) 中的本地部署部分。

### 生产环境部署

参考 [部署文档](doc/deployment.md) 中的生产环境部署部分。

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 贡献

欢迎贡献代码！请参考 [贡献指南](CONTRIBUTING.md)。

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 常见问题

### Q: 如何切换主题？

A: 点击右上角的主题选择器，选择 Light、Dark 或 System。

### Q: 如何切换语言？

A: 点击右上角的语言选择器，选择 English 或 中文。

### Q: 如何筛选任务？

A: 点击状态筛选按钮或标签云中的标签进行筛选。

### Q: 如何修改每页显示数量？

A: 点击分页栏中的每页数量选择器，选择每页显示数量。

更多常见问题请参考 [使用说明文档](doc/usage.md)。

---

## 更新日志

### v1.0.0 (2026-03-30)

#### 新增功能
- 任务管理（创建、编辑、删除、查看）
- 主题切换（浅色、深色、系统）
- 多语言支持（英语、中文）
- 标题和副标题
- 状态筛选（多选）
- 标签管理
- 标签云
- 分页功能
- 任务选中
- 渐进式删除动画
- 悬停和选中效果
- 移动端支持
- 局域网访问

#### 修复问题
- 修复前端数据格式问题
- 修复编辑任务闪烁问题
- 修复标签字段类型错误
- 修复删除任务成功提示
- 修复移动端局域网访问问题
- 修复标签云样式问题
- 修复修改任务后高亮状态丢失问题

#### 优化改进
- 优化用户体验
- 优化动画效果
- 优化性能
- 优化代码质量

---

## 路线图

### v1.1.0 (计划中)
- [ ] 任务搜索功能
- [ ] 任务排序功能
- [ ] 批量操作功能
- [ ] 任务导出功能

### v1.2.0 (计划中)
- [ ] 任务模板功能
- [ ] 任务提醒功能
- [ ] 任务统计功能
- [ ] 团队协作功能

### v2.0.0 (计划中)
- [ ] 任务依赖关系
- [ ] 任务甘特图
- [ ] 任务看板
- [ ] 任务时间追踪

---

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 致谢

感谢所有为 TaskManager 项目做出贡献的开发者和用户。

---

## 联系方式

- **GitHub**: https://github.com/your-username/TaskManager
- **Issues**: https://github.com/your-username/TaskManager/issues
- **Email**: support@example.com

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️**

Made with ❤️ by 白晶晶

</div>
