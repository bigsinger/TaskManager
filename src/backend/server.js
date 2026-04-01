const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// ==================== 认证中间件 ====================

// 验证JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// 可选认证（用于公开API）
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
}

// 租户中间件
function requireTenant(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || (req.user && req.user.tenant_id);
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required' });
  }
  
  req.tenant_id = tenantId;
  next();
}

// 权限检查中间件
function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await checkPermission(req.user.id, permission, req.tenant_id);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    next();
  };
}

// ==================== 健康检查 ====================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.1.0'
  });
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
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 更新登录时间
    await updateUserLoginTime(user.id);

    // 获取用户角色
    const roles = await getUserRoles(user.id, tenant.id);

    // 生成token
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
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
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

// ==================== 用户管理 ====================

// 创建用户（需要管理权限）
app.post('/api/users', authenticateToken, requireTenant, requirePermission('user:create'), async (req, res) => {
  try {
    const { email, name, password, role_id, group_ids = [] } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name and password are required' });
    }

    // 检查邮箱是否已存在
    const existingUser = await getUserByEmail(req.tenant_id, email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      tenant_id: req.tenant_id,
      email,
      name,
      password_hash: passwordHash
    });

    // 分配角色
    if (role_id) {
      await assignRole(user.id, role_id);
    }

    // 添加到组织
    for (const group_id of group_ids) {
      await addGroupMember(group_id, user.id);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 获取用户列表
app.get('/api/users', authenticateToken, requireTenant, async (req, res) => {
  try {
    // 简化为返回当前用户信息，实际应查询所有用户
    const user = await getUserById(req.user.id);
    res.json({ users: [user] });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// ==================== 组织架构 ====================

// 获取组织树
app.get('/api/groups', authenticateToken, requireTenant, async (req, res) => {
  try {
    const tree = await getGroupTree(req.tenant_id);
    res.json({ groups: tree });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// 创建组织
app.post('/api/groups', authenticateToken, requireTenant, requirePermission('group:create'), async (req, res) => {
  try {
    const { parent_id, name, level, type, manager_id, description } = req.body;

    if (!name || !level || !type) {
      return res.status(400).json({ error: 'Name, level and type are required' });
    }

    // 验证层级
    if (![1, 2, 3].includes(parseInt(level))) {
      return res.status(400).json({ error: 'Level must be 1, 2, or 3' });
    }

    // 验证父级
    if (parent_id) {
      const parent = await getGroupById(parent_id);
      if (!parent || parent.tenant_id !== req.tenant_id) {
        return res.status(404).json({ error: 'Parent group not found' });
      }
      if (parent.level >= level) {
        return res.status(400).json({ error: 'Invalid parent level' });
      }
    }

    const group = await createGroup({
      tenant_id: req.tenant_id,
      parent_id,
      name,
      level,
      type,
      manager_id,
      description
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// 获取组织成员
app.get('/api/groups/:id/members', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const group = await getGroupById(id);
    
    if (!group || group.tenant_id !== req.tenant_id) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = await getGroupMembers(id);
    res.json({ members });
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ error: 'Failed to get group members' });
  }
});

// 添加成员到组织
app.post('/api/groups/:id/members', authenticateToken, requireTenant, requirePermission('group:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const group = await getGroupById(id);
    if (!group || group.tenant_id !== req.tenant_id) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const added = await addGroupMember(id, user_id);
    if (!added) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add group member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// ==================== 角色管理 ====================

// 获取角色列表
app.get('/api/roles', authenticateToken, requireTenant, async (req, res) => {
  try {
    const roles = await getRolesByTenant(req.tenant_id);
    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to get roles' });
  }
});

// 创建角色
app.post('/api/roles', authenticateToken, requireTenant, requirePermission('role:create'), async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Name and permissions are required' });
    }

    const role = await createRole({
      tenant_id: req.tenant_id,
      name,
      permissions
    });

    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// 分配角色给用户
app.post('/api/users/:userId/roles', authenticateToken, requireTenant, requirePermission('role:assign'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role_id, group_id } = req.body;

    const assigned = await assignRole(userId, role_id, group_id);
    if (!assigned) {
      return res.status(409).json({ error: 'Role already assigned' });
    }

    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

// ==================== 任务管理 ====================

// 获取任务列表
app.get('/api/tasks', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      group_id, 
      assignee_id,
      sortBy = 'status', 
      sortOrder = 'asc' 
    } = req.query;

    // 检查权限
    const canViewAll = await checkPermission(req.user.id, 'task:view:all', req.tenant_id);
    const filterAssignee = !canViewAll ? req.user.id : assignee_id;

    const result = await getTasks({
      tenant_id: req.tenant_id,
      group_id,
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      assignee_id: filterAssignee,
      sortBy,
      sortOrder
    });

    res.json(result);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// 获取单个任务
app.get('/api/tasks/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTaskById(id, req.tenant_id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 检查权限
    const canViewAll = await checkPermission(req.user.id, 'task:view:all', req.tenant_id);
    if (!canViewAll && task.assignee_id !== req.user.id && task.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // 获取评论和活动
    const comments = await getTaskComments(id);
    const activities = await getTaskActivities(id);

    res.json({
      ...task,
      comments,
      activities
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// 创建任务
app.post('/api/tasks', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { title, description, status, priority, tags, due_date, group_id, assignee_id } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // 检查创建权限
    const hasPermission = await checkPermission(req.user.id, 'task:create', req.tenant_id);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const task = await createTask({
      tenant_id: req.tenant_id,
      group_id,
      creator_id: req.user.id,
      assignee_id,
      title: title.trim(),
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      tags: tags || [],
      due_date
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// 更新任务
app.put('/api/tasks/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await getTaskById(id, req.tenant_id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 权限检查
    const isOwner = task.creator_id === req.user.id;
    const isAssignee = task.assignee_id === req.user.id;

    // 任务执行者只能修改自己的任务状态
    const canEditAll = await checkPermission(req.user.id, 'task:edit', req.tenant_id);
    const canChangeStatus = await checkPermission(req.user.id, 'task:status:change', req.tenant_id);
    const canChangeOwnStatus = await checkPermission(req.user.id, 'task:status:change:own', req.tenant_id);

    // 过滤允许的更新字段
    const allowedUpdates = {};
    
    if (canEditAll || isOwner) {
      // 可以修改所有字段
      Object.assign(allowedUpdates, updates);
    } else if (canChangeStatus) {
      // 项目管理者：可以改状态，但不能改内容
      if (updates.status) allowedUpdates.status = updates.status;
      if (updates.assignee_id) allowedUpdates.assignee_id = updates.assignee_id;
    } else if (canChangeOwnStatus && isAssignee) {
      // 任务执行者：只能改自己的任务状态
      if (updates.status) allowedUpdates.status = updates.status;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updated = await updateTask(id, req.tenant_id, allowedUpdates, req.user.id);
    res.json(updated);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// 删除任务
app.delete('/api/tasks/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await getTaskById(id, req.tenant_id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 检查删除权限
    const isOwner = task.creator_id === req.user.id;
    const canDelete = await checkPermission(req.user.id, 'task:delete', req.tenant_id);

    if (!canDelete && !isOwner) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await deleteTask(id, req.tenant_id, req.user.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ==================== 任务评论 ====================

// 获取评论列表
app.get('/api/tasks/:id/comments', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await getTaskComments(id);
    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// 创建评论
app.post('/api/tasks/:id/comments', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, content_type, parent_id, attachments, mentions } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // 检查评论权限
    const hasPermission = await checkPermission(req.user.id, 'task:comment', req.tenant_id);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const comment = await createComment({
      task_id: id,
      author_id: req.user.id,
      parent_id,
      content: content.trim(),
      content_type: content_type || 'text',
      attachments,
      mentions
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// 更新评论
app.put('/api/comments/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, content_type } = req.body;

    const comment = await getCommentById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // 只能修改自己的评论
    if (comment.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updated = await updateComment(id, content, content_type);
    res.json(updated);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// 删除评论
app.delete('/api/comments/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await getCommentById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // 检查权限（自己或管理员）
    const isAuthor = comment.author_id === req.user.id;
    const canDelete = await checkPermission(req.user.id, 'comment:delete:any', req.tenant_id);

    if (!isAuthor && !canDelete) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await deleteComment(id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ==================== 标签管理 ====================

app.get('/api/tags', authenticateToken, requireTenant, async (req, res) => {
  try {
    const tags = await getAllTags(req.tenant_id);
    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

// ==================== 错误处理 ====================

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== 启动服务器 ====================

async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}/api/tasks`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;
