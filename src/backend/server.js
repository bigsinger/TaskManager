const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const { 
  initDatabase,
  createTenant, getTenantById, getTenantBySubdomain,
  createUser, getUserById, getUserByEmail, updateUserLoginTime,
  createGroup, getGroupById, getGroupsByTenant, getGroupTree,
  addGroupMember, removeGroupMember, getGroupMembers,
  createRole, getRoleById, getRolesByTenant,
  assignRole, getUserRoles, checkPermission,
  getTasks, getTaskById, createTask, updateTask, deleteTask,
  getTaskComments, createComment, updateComment, deleteComment,
  getTaskActivities,
  getAllTags
} = require('./database');

// OAuth imports
const { initializePassport, getOAuthRoutes, getAvailableProviders } = require('./oauth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport初始化
app.use(passport.initialize());

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../frontend')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== OAuth相关 ====================

// 获取可用的OAuth提供商列表
app.get('/api/auth/providers', (req, res) => {
  const providers = getAvailableProviders();
  res.json({ 
    providers,
    github: {
      enabled: providers.includes('github'),
      url: '/api/auth/github'
    },
    google: {
      enabled: providers.includes('google'),
      url: '/api/auth/google'
    }
  });
});

// 挂载OAuth路由
app.use('/api/auth', getOAuthRoutes());

// ==================== 认证相关 ====================

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { tenant_name, subdomain, email, name, password } = req.body;

    if (!tenant_name || !subdomain || !email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 检查子域名是否可用
    const existingTenant = await getTenantBySubdomain(subdomain);
    if (existingTenant) {
      return res.status(409).json({ error: 'Subdomain already exists' });
    }

    // 创建租户
    const tenant = await createTenant({ name: tenant_name, subdomain });

    // 创建用户（Owner角色）
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      tenant_id: tenant.id,
      email,
      name,
      password_hash: passwordHash
    });

    // 分配Owner角色
    await assignRole(user.id, 'role-owner');

    // 生成token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, tenant_id: tenant.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
      tenant: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { subdomain, email, password } = req.body;

    if (!subdomain || !email || !password) {
      return res.status(400).json({ error: 'Subdomain, email and password are required' });
    }

    // 查找租户
    const tenant = await getTenantBySubdomain(subdomain);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // 查找用户
    const user = await getUserByEmail(tenant.id, email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 验证密码
    const bcrypt = require('bcryptjs');
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 更新登录时间
    await updateUserLoginTime(user.id);

    // 获取用户角色
    const roles = await getUserRoles(user.id, tenant.id);

    // 生成token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, tenant_id: tenant.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        avatar: user.avatar
      },
      tenant: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain },
      roles
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const roles = await getUserRoles(user.id, user.tenant_id);
    const tenant = await getTenantById(user.tenant_id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      tenant,
      roles
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// ========== API路由 ==========

// 获取任务列表
app.get('/api/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, tags, sort, order } = req.query;
    
    // 验证参数
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const result = await getTasks({
      page: parsedPage,
      limit: parsedLimit,
      status,
      tags,
      sort,
      order
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个任务
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建任务
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, tags } = req.body;

    // 验证必填字段
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // 验证标题长度
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }

    // 验证描述长度
    if (description && description.length > 1000) {
      return res.status(400).json({ error: 'Description must be less than 1000 characters' });
    }

    // 验证状态
    const validStatuses = ['pending', 'in-progress', 'completed'];
    const taskStatus = status || 'pending';
    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await createTask({
      title: title.trim(),
      description: description || '',
      status: taskStatus,
      tags: tags || []
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新任务
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, tags } = req.body;

    // 检查任务是否存在
    const existingTask = await getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 验证标题
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: 'Title must be less than 200 characters' });
      }
    }

    // 验证描述
    if (description !== undefined && description.length > 1000) {
      return res.status(400).json({ error: 'Description must be less than 1000 characters' });
    }

    // 验证状态
    if (status !== undefined) {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }

    const task = await updateTask(id, {
      title: title !== undefined ? title.trim() : undefined,
      description,
      status,
      tags
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查任务是否存在
    const existingTask = await getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const success = await deleteTask(id);
    
    if (success) {
      res.json({ message: 'Task deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取所有标签
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await getAllTags();
    res.json({ tags });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    
    // 初始化Passport OAuth策略
    initializePassport();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}/api/tasks`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});