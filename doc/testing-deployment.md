# TaskManager 测试与部署文档

> 本文档说明 TaskManager 项目的自动化测试和自动化部署配置

---

## 🧪 自动化测试

### 测试结构

```
TaskManager/
├── src/
│   ├── backend/
│   │   └── __tests__/
│   │       ├── database.test.js    # 数据库单元测试
│   │       └── api.test.js         # API集成测试
│   └── frontend/
│       └── modules/
│           └── __tests__/
│               └── search.test.js  # 前端模块测试
```

### 运行测试

#### 1. 安装所有依赖
```bash
npm run install:all
```

#### 2. 运行所有测试
```bash
npm test
```

#### 3. 仅运行后端测试
```bash
cd src/backend
npm test
```

#### 4. 仅运行前端测试
```bash
cd src/frontend
npm test
```

#### 5. 监视模式运行测试
```bash
cd src/backend
npm run test:watch
```

### 测试覆盖率

测试覆盖率报告将生成在：
- 后端: `src/backend/coverage/`
- 前端: `src/frontend/coverage/`

查看 HTML 报告：
```bash
cd src/backend/coverage
npx serve
```

---

## 🚀 自动化部署

### Docker 部署

#### 1. 构建镜像
```bash
docker-compose build
```

#### 2. 启动服务
```bash
docker-compose up -d
```

#### 3. 查看日志
```bash
docker-compose logs -f
```

#### 4. 停止服务
```bash
docker-compose down
```

#### 5. 查看服务状态
```bash
docker-compose ps
```

### 生产部署

#### 使用 Docker Compose

```bash
# 生产环境部署
docker-compose -f docker-compose.yml up -d

# 查看服务健康状态
docker-compose ps
```

#### 环境变量配置

创建 `.env` 文件：
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/app/data/tasks.db
```

---

## 🔄 CI/CD 流水线

### GitHub Actions 工作流

配置文件：`.github/workflows/ci-cd.yml`

#### 触发条件

| 事件 | 分支 | 执行 |
|------|------|------|
| push | main, v2.0, develop | 完整测试 |
| push | main | 部署到生产环境 |
| push | v2.0 | 部署到预发布环境 |
| pull_request | main, v2.0 | 测试 |

#### 流水线阶段

```
1. test-backend     # 后端单元测试
2. test-frontend    # 前端单元测试
3. test-integration # API集成测试
4. build-docker     # 构建Docker镜像
5. deploy-staging   # 部署到预发布环境
6. deploy-production # 部署到生产环境
```

#### 状态徽章

添加以下内容到 README.md：
```markdown
![CI/CD](https://github.com/bigsinger/TaskManager/workflows/CI/CD%20Pipeline/badge.svg)
```

---

## 📦 部署清单

### 首次部署检查项

- [ ] 服务器已安装 Docker 和 Docker Compose
- [ ] 服务器已开放端口 3000（后端）和 3001（前端）
- [ ] 已配置环境变量
- [ ] 已创建数据卷目录
- [ ] 已配置反向代理（Nginx/Traefik）
- [ ] 已配置 SSL 证书
- [ ] 已配置监控和日志收集

### 部署命令速查

```bash
# 克隆代码
git clone https://github.com/bigsinger/TaskManager.git
cd TaskManager

# 切换到目标分支
git checkout v2.0

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🔧 本地开发

### 快速启动

```bash
# 安装依赖
npm run install:all

# 同时启动前后端
npm start
```

### 分别启动

```bash
# 终端1：启动后端
cd src/backend
npm start

# 终端2：启动前端
cd src/frontend
npm start
```

---

## 📊 监控与健康检查

### 健康检查端点

- 后端: http://localhost:3000/health
- 前端: http://localhost:3001/health (通过 Nginx)

### Docker 健康检查

自动配置的健康检查：
- 后端：每 30 秒检查 API 可用性
- 前端：每 30 秒检查 Nginx 可用性

---

## 🛠️ 故障排查

### 常见问题

#### 1. 端口被占用
```bash
# 查找占用 3000 端口的进程
netstat -ano | findstr :3000

# 停止进程
taskkill /PID <PID> /F
```

#### 2. 数据库权限错误
```bash
# 检查数据卷权限
docker-compose exec backend ls -la /app/data

# 修复权限
docker-compose exec backend chmod 755 /app/data
```

#### 3. 测试失败
```bash
# 清除测试缓存
npm test -- --clearCache

# 重新运行
npm test
```

---

## 📝 更新日志

### 2026-04-01
- ✅ 添加 Jest 测试框架
- ✅ 添加后端单元测试和集成测试
- ✅ 添加前端模块测试
- ✅ 添加 GitHub Actions CI/CD
- ✅ 添加 Docker 和 Docker Compose 配置
- ✅ 添加 Nginx 反向代理配置

---

## 🔗 相关文档

- [项目README](../README.md)
- [后端API文档](./design.md)
