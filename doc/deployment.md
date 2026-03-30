# TaskManager v1.0 部署文档

**项目**: TaskManager 企业级任务管理系统
**版本**: v1.0
**创建日期**: 2026-03-30
**最后更新**: 2026-03-30
**维护人**: 白晶晶

---

## 部署概述

### 部署目标

将 TaskManager v1.0 部署到生产环境，确保系统稳定运行。

### 部署环境

- **操作系统**：Windows / macOS / Linux
- **Node.js**：v18+
- **数据库**：SQLite
- **前端服务**：http-server
- **后端服务**：Node.js + Express

---

## 前置条件

### 1. 环境要求

#### 1.1 Node.js
- 版本：v18 或更高
- 安装方式：
  - 官网下载：https://nodejs.org/
  - 使用 nvm 安装：`nvm install 18`

#### 1.2 npm
- 版本：v9 或更高
- 安装方式：随 Node.js 一起安装

#### 1.3 Git
- 版本：v2 或更高
- 安装方式：
  - 官网下载：https://git-scm.com/
  - 使用包管理器安装

### 2. 端口要求

- 前端端口：3001
- 后端端口：3000

### 3. 网络要求

- 需要访问 npm 仓库
- 需要访问 GitHub（可选）

---

## 部署步骤

### 1. 克隆项目

```bash
# 克隆项目到本地
git clone https://github.com/your-username/TaskManager.git
cd TaskManager
```

### 2. 安装依赖

#### 2.1 安装前端依赖

```bash
cd src/frontend
npm install
```

#### 2.2 安装后端依赖

```bash
cd ../backend
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
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### 4. 初始化数据库

```bash
cd src/backend
npx prisma generate
npx prisma migrate dev
```

#### 4.1 常见迁移问题及解决方案

##### 问题1：Environment variable not found: DATABASE_URL

**错误信息**：
```
Environment variable not found: DATABASE_URL.
```

**原因**：
缺少 `.env` 文件或 `.env` 文件中未配置 `DATABASE_URL`。

**解决方案**：
```bash
# 1. 创建 .env 文件
cd src/backend
cp .env.example .env

# 2. 确认 .env 文件中的 DATABASE_URL 配置正确
DATABASE_URL="file:./dev.db"
```

**注意**：
- `DATABASE_URL` 必须设置为 `file:./dev.db`（SQLite 数据库）
- 不要使用 PostgreSQL 配置（如 `postgresql://user:password@localhost:5432/task_manager`）

##### 问题2：Prisma Client 生成失败

**错误信息**：
```
Error: P3006
Migration failed to apply.
```

**原因**：
数据库文件不存在或权限不足。

**解决方案**：
```bash
# 1. 删除旧的数据库文件
cd src/backend/prisma
rm -f dev.db dev.db-shm dev.db-wal

# 2. 重新生成 Prisma Client
cd ..
npx prisma generate

# 3. 重新运行迁移
npx prisma migrate dev
```

##### 问题3：迁移冲突

**错误信息**：
```
Error: P3005
The database schema is not empty.
```

**原因**：
数据库已存在数据，与迁移脚本冲突。

**解决方案**：
```bash
# 方案1：重置数据库（会丢失所有数据）
npx prisma migrate reset

# 方案2：手动删除数据库文件
cd src/backend/prisma
rm -f dev.db dev.db-shm dev.db-wal
cd ..
npx prisma migrate dev
```

**注意**：
- 方案1会丢失所有数据，请谨慎使用
- 方案2也会丢失所有数据，请谨慎使用

##### 问题4：Prisma 版本不兼容

**错误信息**：
```
Error: This version of Prisma Client is not compatible with the Prisma schema.
```

**原因**：
Prisma Client 版本与 Prisma schema 不匹配。

**解决方案**：
```bash
# 1. 重新生成 Prisma Client
npx prisma generate

# 2. 如果仍然失败，更新 Prisma
npm install prisma@latest @prisma/client@latest

# 3. 重新生成 Prisma Client
npx prisma generate
```

##### 问题5：数据库文件权限问题

**错误信息**：
```
Error: EACCES: permission denied, open 'prisma/dev.db'
```

**原因**：
数据库文件权限不足。

**解决方案**：
```bash
# Linux/Mac
chmod 644 src/backend/prisma/dev.db

# Windows
# 右键点击 dev.db 文件 -> 属性 -> 安全 -> 编辑权限
```

#### 4.2 迁移最佳实践

1. **备份现有数据**
   ```bash
   # 备份数据库文件
   cp src/backend/prisma/dev.db src/backend/prisma/dev.db.backup
   ```

2. **使用开发环境测试**
   ```bash
   # 在开发环境先测试迁移
   NODE_ENV=development npx prisma migrate dev
   ```

3. **检查迁移结果**
   ```bash
   # 查看迁移历史
   npx prisma migrate status

   # 查看数据库结构
   npx prisma studio
   ```

4. **回滚迁移（如果需要）**
   ```bash
   # 回滚到上一个迁移
   npx prisma migrate resolve --rolled-back [migration-name]
   ```

### 5. 构建后端

```bash
cd src/backend
npm run build
```

### 6. 启动服务

#### 6.1 启动后端服务

```bash
cd src/backend
npm start
```

#### 6.2 启动前端服务

```bash
cd src/frontend
npx http-server -p 3001
```

### 7. 验证部署

#### 7.1 访问前端

打开浏览器，访问：http://localhost:3001

#### 7.2 访问后端

打开浏览器，访问：http://localhost:3000/api/tasks

---

## 生产环境部署

### 1. 使用 PM2 管理进程

#### 1.1 安装 PM2

```bash
npm install -g pm2
```

#### 1.2 创建 PM2 配置文件

创建 `ecosystem.config.js`：

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
      }
    },
    {
      name: 'taskmanager-frontend',
      script: './node_modules/http-server/bin/http-server',
      args: './src/frontend -p 3001',
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

创建 `/etc/nginx/sites-available/taskmanager`：

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

**前端 Dockerfile** (`src/frontend/Dockerfile`)：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npx", "http-server", "-p", "3001"]
```

**后端 Dockerfile** (`src/backend/Dockerfile`)：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 3.2 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./src/backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:./dev.db
    volumes:
      - ./src/backend/prisma:/app/prisma
    restart: unless-stopped

  frontend:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      - backend
    restart: unless-stopped
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
```

### 4. 使用 Systemd 服务

#### 4.1 创建后端服务文件

创建 `/etc/systemd/system/taskmanager-backend.service`：

```ini
[Unit]
Description=TaskManager Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/TaskManager/src/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

#### 4.2 创建前端服务文件

创建 `/etc/systemd/system/taskmanager-frontend.service`：

```ini
[Unit]
Description=TaskManager Frontend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/TaskManager/src/frontend
ExecStart=/usr/bin/npx http-server -p 3001
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

## 数据库部署

### 1. SQLite 数据库

#### 1.1 数据库位置

数据库文件位于：`src/backend/prisma/dev.db`

#### 1.2 数据库备份

```bash
# 备份数据库
cp src/backend/prisma/dev.db src/backend/prisma/dev.db.backup

# 定期备份（使用 cron）
0 2 * * * cp /path/to/TaskManager/src/backend/prisma/dev.db /path/to/backups/dev.db.$(date +\%Y\%m\%d)
```

#### 1.3 数据库恢复

```bash
# 恢复数据库
cp src/backend/prisma/dev.db.backup src/backend/prisma/dev.db
```

### 2. 数据库迁移

```bash
cd src/backend

# 创建迁移
npx prisma migrate dev --name migration_name

# 应用迁移
npx prisma migrate deploy

# 重置数据库（慎用）
npx prisma migrate reset
```

---

## 监控和日志

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
```

### 3. 错误监控

#### 3.1 查看错误日志

```bash
# PM2 错误日志
pm2 logs --err

# Systemd 错误日志
sudo journalctl -u taskmanager-backend -p err
```

---

## 安全配置

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

## 备份和恢复

### 1. 数据备份

#### 1.1 数据库备份

```bash
# 创建备份目录
mkdir -p /path/to/backups

# 备份数据库
cp src/backend/prisma/dev.db /path/to/backups/dev.db.$(date +%Y%m%d_%H%M%S)

# 压缩备份
gzip /path/to/backups/dev.db.$(date +%Y%m%d_%H%M%S)
```

#### 1.2 代码备份

```bash
# 备份代码
tar -czf /path/to/backups/taskmanager.$(date +%Y%m%d_%H%M%S).tar.gz .
```

### 2. 自动备份

#### 2.1 使用 Cron

```bash
# 编辑 crontab
crontab -e

# 添加备份任务
0 2 * * * cp /path/to/TaskManager/src/backend/prisma/dev.db /path/to/backups/dev.db.$(date +\%Y\%m\%d)
0 3 * * * tar -czf /path/to/backups/taskmanager.$(date +\%Y\%m\%d).tar.gz /path/to/TaskManager
```

### 3. 恢复流程

#### 3.1 恢复数据库

```bash
# 停止服务
pm2 stop all

# 恢复数据库
cp /path/to/backups/dev.db.20260330 src/backend/prisma/dev.db

# 启动服务
pm2 start all
```

#### 3.2 恢复代码

```bash
# 停止服务
pm2 stop all

# 恢复代码
tar -xzf /path/to/backups/taskmanager.20260330.tar.gz -C /path/to/

# 安装依赖
cd /path/to/TaskManager/src/backend
npm install

cd ../frontend
npm install

# 启动服务
pm2 start all
```

---

## 故障排查

### 1. 常见问题

#### 1.1 端口被占用

**问题**：端口 3000 或 3001 被占用

**解决方案**：
```bash
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 杀死进程
taskkill /PID <PID> /F

# 或修改端口
# 编辑 .env 文件，修改 PORT
```

#### 1.2 数据库连接失败

**问题**：无法连接到数据库

**解决方案**：
```bash
# 检查数据库文件是否存在
ls -la src/backend/prisma/dev.db

# 重新生成 Prisma Client
cd src/backend
npx prisma generate

# 重新迁移
npx prisma migrate dev
```

#### 1.3 依赖安装失败

**问题**：npm install 失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules

# 重新安装
npm install
```

#### 1.4 权限问题

**问题**：权限不足

**解决方案**：
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
```

#### 2.2 查看访问日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 更新和维护

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
```

### 2. 维护计划

#### 2.1 定期维护

- 每周：检查日志
- 每月：更新依赖
- 每季度：安全审计

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

## 性能优化

### 1. 前端优化

#### 1.1 启用压缩

```nginx
# Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

#### 1.2 启用缓存

```nginx
# Nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
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
}
```

---

## 总结

TaskManager v1.0 的部署流程已经详细说明，包括本地部署、生产环境部署、监控和日志、安全配置、备份和恢复、故障排查、更新和维护、性能优化等方面。

**文档版本**: 1.0
