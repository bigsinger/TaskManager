# TaskManager 完整部署运维文档

> **项目**: TaskManager 企业级任务管理系统
> **当前版本**: v2.2.0
> **创建日期**: 2026-03-30
> **最后更新**: 2026-04-03
> **维护人**: 白晶晶

---

## 📋 文档概述

本文档整合了 TaskManager 项目的所有部署运维相关内容,包括:
- 本地部署
- 生产环境部署
- Docker 部署
- CI/CD 配置
- 监控和日志
- 备份和恢复
- 故障排查

---

## 🚀 部署概述

### 部署目标

将 TaskManager v2.2.0 部署到生产环境,确保系统稳定运行。

### 部署环境

- **操作系统**: Windows / macOS / Linux
- **Node.js**: v18+
- **数据库**: PostgreSQL 15+
- **缓存**: Redis 7+
- **前端服务**: Vite + React
- **后端服务**: Node.js + Express

---

## 📦 前置条件

### 1. 环境要求

#### 1.1 Node.js
- **版本**: v18 或更高
- **安装方式**:
  - 官网下载: https://nodejs.org/
  - 使用 nvm 安装: `nvm install 18`

#### 1.2 npm
- **版本**: v9 或更高
- **安装方式**: 随 Node.js 一起安装

#### 1.3 Git
- **版本**: v2 或更高
- **安装方式**:
  - 官网下载: https://git-scm.com/
  - 使用包管理器安装

#### 1.4 PostgreSQL
- **版本**: 15 或更高
- **安装方式**:
  - 官网下载: https://www.postgresql.org/download/
  - 使用 Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15`

#### 1.5 Redis
- **版本**: 7 或更高
- **安装方式**:
  - 官网下载: https://redis.io/download
  - 使用 Docker: `docker run -d -p 6379:6379 redis:7`

### 2. 端口要求

- **前端端口**: 3001
- **后端端口**: 3000
- **PostgreSQL 端口**: 5432
- **Redis 端口**: 6379

### 3. 网络要求

- 需要访问 npm 仓库
- 需要访问 GitHub (可选)

---

## 💻 本地部署

### 1. 克隆项目

```bash
# 克隆项目到本地
git clone https://github.com/your-username/TaskManager.git
cd TaskManager
```

### 2. 安装依赖

#### 2.1 安装后端依赖

```bash
cd src/backend
npm install
```

#### 2.2 安装前端依赖

```bash
cd src/frontend
npm install
```

### 3. 配置环境变量

#### 3.1 创建 .env 文件

```bash
cd src/backend
cp .env.example .env
```

#### 3.2 编辑 .env 文件

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmanager"

# Redis 配置
REDIS_URL="redis://localhost:6379"

# JWT 配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# OAuth 配置
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3001/auth/github/callback

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# CORS 配置
CORS_ORIGIN=http://localhost:3001
```

### 4. 初始化数据库

```bash
cd src/backend

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# (可选) 填充种子数据
npx prisma db seed
```

#### 4.1 常见迁移问题及解决方案

##### 问题1: Environment variable not found: DATABASE_URL

**错误信息**:
```
Environment variable not found: DATABASE_URL.
```

**原因**:
缺少 `.env` 文件或 `.env` 文件中未配置 `DATABASE_URL`。

**解决方案**:
```bash
# 1. 创建 .env 文件
cd src/backend
cp .env.example .env

# 2. 确认 .env 文件中的 DATABASE_URL 配置正确
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmanager"
```

##### 问题2: Prisma Client 生成失败

**错误信息**:
```
Error: P3006
Migration failed to apply.
```

**原因**:
数据库不存在或权限不足。

**解决方案**:
```bash
# 1. 创建数据库
createdb taskmanager

# 2. 重新生成 Prisma Client
npx prisma generate

# 3. 重新运行迁移
npx prisma migrate dev
```

##### 问题3: 迁移冲突

**错误信息**:
```
Error: P3005
The database schema is not empty.
```

**原因**:
数据库已存在数据,与迁移脚本冲突。

**解决方案**:
```bash
# 方案1: 重置数据库（会丢失所有数据）
npx prisma migrate reset

# 方案2: 手动删除数据库
dropdb taskmanager
createdb taskmanager
npx prisma migrate dev
```

##### 问题4: Prisma 版本不兼容

**错误信息**:
```
Error: This version of Prisma Client is not compatible with the Prisma schema.
```

**原因**:
Prisma Client 版本与 Prisma schema 不匹配。

**解决方案**:
```bash
# 1. 重新生成 Prisma Client
npx prisma generate

# 2. 如果仍然失败,更新 Prisma
npm install prisma@latest @prisma/client@latest

# 3. 重新生成 Prisma Client
npx prisma generate
```

### 5. 构建项目

#### 5.1 构建后端

```bash
cd src/backend
npm run build
```

#### 5.2 构建前端

```bash
cd src/frontend
npm run build
```

### 6. 启动服务

#### 6.1 启动后端服务

```bash
cd src/backend
npm start
```

或使用开发模式:

```bash
npm run dev
```

#### 6.2 启动前端服务

```bash
cd src/frontend
npm run dev
```

### 7. 验证部署

#### 7.1 访问前端

打开浏览器,访问: http://localhost:3001

#### 7.2 访问后端

打开浏览器,访问: http://localhost:3000/api/tasks

---

## 🌐 生产环境部署

### 1. 使用 PM2 管理进程

#### 1.1 安装 PM2

```bash
npm install -g pm2
```

#### 1.2 创建 PM2 配置文件

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'taskmanager-backend',
      script: './src/backend/dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'taskmanager-frontend',
      script: './src/frontend/dist/index.html',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
```

#### 1.3 启动 PM2

```bash
pm2 start ecosystem.config.js
```

#### 1.4 查看 PM2 状态

```bash
pm2 status
```

#### 1.5 查看 PM2 日志

```bash
pm2 logs
```

#### 1.6 重启 PM2

```bash
pm2 restart all
```

#### 1.7 停止 PM2

```bash
pm2 stop all
```

### 2. 使用 Nginx 反向代理

#### 2.1 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx

# macOS
brew install nginx
```

#### 2.2 配置 Nginx

创建 `/etc/nginx/sites-available/taskmanager`:

```nginx
server {
    listen 80;
    server_name taskmanager.example.com;

    # 前端
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 2.3 启用配置

```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/taskmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# CentOS/RHEL
sudo nginx -t
sudo systemctl restart nginx

# macOS
sudo nginx -t
sudo nginx -s reload
```

### 3. 使用 Docker 部署

#### 3.1 创建 Dockerfile

**后端 Dockerfile** (`src/backend/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**前端 Dockerfile** (`src/frontend/Dockerfile`):

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3.2 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: taskmanager-postgres
    environment:
      POSTGRES_DB: taskmanager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - taskmanager-network

  redis:
    image: redis:7
    container_name: taskmanager-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - taskmanager-network

  backend:
    build:
      context: ./src/backend
      dockerfile: Dockerfile
    container_name: taskmanager-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/taskmanager
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - taskmanager-network

  frontend:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile
    container_name: taskmanager-frontend
    ports:
      - "3001:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - taskmanager-network

volumes:
  postgres_data:

networks:
  taskmanager-network:
    driver: bridge
```

#### 3.3 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v
```

### 4. 使用 Systemd 服务

#### 4.1 创建后端服务文件

创建 `/etc/systemd/system/taskmanager-backend.service`:

```ini
[Unit]
Description=TaskManager Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/TaskManager/src/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskmanager
Environment=REDIS_URL=redis://localhost:6379

[Install]
WantedBy=multi-user.target
```

#### 4.2 创建前端服务文件

创建 `/etc/systemd/system/taskmanager-frontend.service`:

```ini
[Unit]
Description=TaskManager Frontend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/TaskManager/src/frontend
ExecStart=/usr/bin/nginx -c /path/to/nginx.conf
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 4.3 启动服务

```bash
# 重载 systemd
sudo systemctl daemon-reload

# 启动后端服务
sudo systemctl start taskmanager-backend
sudo systemctl enable taskmanager-backend

# 启动前端服务
sudo systemctl start taskmanager-frontend
sudo systemctl enable taskmanager-frontend

# 查看服务状态
sudo systemctl status taskmanager-backend
sudo systemctl status taskmanager-frontend

# 查看服务日志
sudo journalctl -u taskmanager-backend -f
sudo journalctl -u taskmanager-frontend -f
```

---

## 📊 监控和日志

### 1. 日志管理

#### 1.1 PM2 日志

```bash
# 查看所有日志
pm2 logs

# 查看特定应用日志
pm2 logs taskmanager-backend
pm2 logs taskmanager-frontend

# 清空日志
pm2 flush

# 日志轮转
pm2 install pm2-logrotate
```

#### 1.2 Systemd 日志

```bash
# 查看后端日志
sudo journalctl -u taskmanager-backend -f

# 查看前端日志
sudo journalctl -u taskmanager-frontend -f

# 查看最近100行日志
sudo journalctl -u taskmanager-backend -n 100
```

#### 1.3 Docker 日志

```bash
# 查看所有容器日志
docker-compose logs -f

# 查看特定容器日志
docker logs -f taskmanager-backend
docker logs -f taskmanager-frontend

# 查看最近100行日志
docker logs --tail 100 taskmanager-backend
```

### 2. 性能监控

#### 2.1 PM2 监控

```bash
# 查看监控
pm2 monit
```

#### 2.2 系统监控

```bash
# 查看系统资源
top
htop

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看网络连接
netstat -tulpn
```

#### 2.3 应用监控

```typescript
// 添加性能监控中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

### 3. 错误监控

#### 3.1 查看错误日志

```bash
# PM2 错误日志
pm2 logs --err

# Systemd 错误日志
sudo journalctl -u taskmanager-backend -p err

# Docker 错误日志
docker-compose logs --tail=100 backend | grep ERROR
```

#### 3.2 集成 Sentry

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

---

## 🔒 安全配置

### 1. 防火墙配置

#### 1.1 UFW (Ubuntu)

```bash
# 启用防火墙
sudo ufw enable

# 允许 HTTP
sudo ufw allow 80/tcp

# 允许 HTTPS
sudo ufw allow 443/tcp

# 允许 SSH
sudo ufw allow 22/tcp

# 查看状态
sudo ufw status
```

#### 1.2 firewalld (CentOS)

```bash
# 启用防火墙
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 允许 HTTP
sudo firewall-cmd --permanent --add-service=http

# 允许 HTTPS
sudo firewall-cmd --permanent --add-service=https

# 允许 SSH
sudo firewall-cmd --permanent --add-service=ssh

# 重载防火墙
sudo firewall-cmd --reload

# 查看状态
sudo firewall-cmd --list-all
```

### 2. SSL/TLS 配置

#### 2.1 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d taskmanager.example.com

# 自动续期
sudo certbot renew --dry-run
```

#### 2.2 Nginx SSL 配置

```nginx
server {
    listen 443 ssl http2;
    server_name taskmanager.example.com;

    ssl_certificate /etc/letsencrypt/live/taskmanager.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/taskmanager.example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置...
}

server {
    listen 80;
    server_name taskmanager.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. 环境变量安全

#### 3.1 保护 .env 文件

```bash
# 设置文件权限
chmod 600 src/backend/.env

# 确保 .env 在 .gitignore 中
echo ".env" >> .gitignore
```

#### 3.2 使用密钥管理服务

考虑使用 AWS Secrets Manager、HashiCorp Vault 等密钥管理服务。

---

## 💾 备份和恢复

### 1. 数据备份

#### 1.1 数据库备份

```bash
# 创建备份目录
mkdir -p /path/to/backups

# 备份数据库
pg_dump -U postgres -h localhost taskmanager > /path/to/backups/taskmanager_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份
gzip /path/to/backups/taskmanager_$(date +%Y%m%d_%H%M%S).sql
```

#### 1.2 代码备份

```bash
# 备份代码
tar -czf /path/to/backups/taskmanager_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/TaskManager
```

### 2. 自动备份

#### 2.1 使用 Cron

```bash
# 编辑 crontab
crontab -e

# 添加备份任务
0 2 * * * pg_dump -U postgres -h localhost taskmanager | gzip > /path/to/backups/taskmanager_$(date +\%Y\%m\%d).sql.gz
0 3 * * * tar -czf /path/to/backups/taskmanager_$(date +\%Y\%m\%d).tar.gz /path/to/TaskManager
```

#### 2.2 使用 Docker Volume

```yaml
# docker-compose.yml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/to/backups/postgres
```

### 3. 恢复流程

#### 3.1 恢复数据库

```bash
# 停止服务
pm2 stop all

# 恢复数据库
gunzip < /path/to/backups/taskmanager_20260330.sql.gz | psql -U postgres -h localhost taskmanager

# 启动服务
pm2 start all
```

#### 3.2 恢复代码

```bash
# 停止服务
pm2 stop all

# 恢复代码
tar -xzf /path/to/backups/taskmanager_20260330.tar.gz -C /path/to/

# 安装依赖
cd /path/to/TaskManager/src/backend
npm install

cd ../frontend
npm install

# 启动服务
pm2 start all
```

---

## 🔧 故障排查

### 1. 常见问题

#### 1.1 端口被占用

**问题**: 端口 3000 或 3001 被占用

**解决方案**:
```bash
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 杀死进程
taskkill /PID <PID> /F

# 或修改端口
# 编辑 .env 文件,修改 PORT
```

#### 1.2 数据库连接失败

**问题**: 无法连接到数据库

**解决方案**:
```bash
# 检查数据库是否运行
sudo systemctl status postgresql

# 检查数据库连接
psql -U postgres -h localhost -d taskmanager

# 重新生成 Prisma Client
cd src/backend
npx prisma generate

# 重新迁移
npx prisma migrate dev
```

#### 1.3 依赖安装失败

**问题**: npm install 失败

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules

# 重新安装
npm install
```

#### 1.4 权限问题

**问题**: 权限不足

**解决方案**:
```bash
# 修改文件权限
chmod +x src/backend/dist/server.js

# 修改目录权限
chmod -R 755 src/backend
chmod -R 755 src/frontend
```

### 2. 日志分析

#### 2.1 查看错误日志

```bash
# PM2 错误日志
pm2 logs --err

# Systemd 错误日志
sudo journalctl -u taskmanager-backend -p err

# Docker 错误日志
docker-compose logs --tail=100 backend | grep ERROR
```

#### 2.2 查看访问日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 更新和维护

### 1. 更新流程

#### 1.1 拉取最新代码

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
cd src/backend
npm install

cd ../frontend
npm install
```

#### 1.2 数据库迁移

```bash
cd src/backend

# 应用迁移
npx prisma migrate deploy
```

#### 1.3 重启服务

```bash
# PM2 重启
pm2 restart all

# Systemd 重启
sudo systemctl restart taskmanager-backend
sudo systemctl restart taskmanager-frontend

# Docker 重启
docker-compose restart
```

### 2. 维护计划

#### 2.1 定期维护

- **每周**: 检查日志
- **每月**: 更新依赖
- **每季度**: 安全审计

#### 2.2 依赖更新

```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 审计安全漏洞
npm audit
npm audit fix
```

---

## 📈 性能优化

### 1. 前端优化

#### 1.1 启用压缩

```nginx
# Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

#### 1.2 启用缓存

```nginx
# Nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 后端优化

#### 2.1 启用缓存

```typescript
// 使用 Redis 缓存
import Redis from 'ioredis';

const redis = new Redis();

// 缓存任务列表
const cachedTasks = await redis.get('tasks');
if (cachedTasks) {
    return JSON.parse(cachedTasks);
}

const tasks = await prisma.task.findMany();
await redis.set('tasks', JSON.stringify(tasks), 'EX', 300);
return tasks;
```

#### 2.2 数据库优化

```typescript
// 使用索引
// Prisma schema
model Task {
  id        String   @id @default(uuid())
  title     String
  status    String
  createdAt DateTime @default(now())

  @@index([status])
  @@index([createdAt])
  @@index([status, createdAt])
}
```

---

## 📝 总结

TaskManager v2.2.0 的部署流程已经详细说明,包括本地部署、生产环境部署、监控和日志、安全配置、备份和恢复、故障排查、更新和维护、性能优化等方面。

**文档版本**: 1.0
**最后更新**: 2026-04-03
**维护者**: 白晶晶
