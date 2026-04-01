const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'tasks.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// 运行SQL（Promise包装）
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// 获取单条记录
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// 获取多条记录
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// 初始化数据库表
async function initDatabase() {
  try {
    // 1. 租户表
    await run(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subdomain TEXT UNIQUE,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'deleted')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. 用户表（多租户）
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        last_login_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, email),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      )
    `);

    // 3. 组织架构表（三级）
    await run(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        parent_id TEXT,
        name TEXT NOT NULL,
        level INTEGER CHECK(level IN (1, 2, 3)),
        type TEXT CHECK(type IN ('department', 'team', 'squad')),
        manager_id TEXT,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 4. 用户-组织关联表
    await run(`
      CREATE TABLE IF NOT EXISTS group_members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 5. 角色表
    await run(`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        permissions TEXT NOT NULL, -- JSON格式
        is_system INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      )
    `);

    // 6. 用户角色表
    await run(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        group_id TEXT, -- 为空表示全局角色
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role_id, group_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      )
    `);

    // 7. 任务表（更新版）
    await run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        group_id TEXT,
        creator_id TEXT NOT NULL,
        assignee_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed')),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
        tags TEXT, -- 逗号分隔
        due_date DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 8. 任务评论表
    await run(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        parent_id TEXT,
        content TEXT NOT NULL,
        content_type TEXT DEFAULT 'text' CHECK(content_type IN ('text', 'markdown', 'html')),
        attachments TEXT, -- JSON格式
        mentions TEXT, -- JSON格式
        is_system INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES task_comments(id) ON DELETE CASCADE
      )
    `);

    // 9. 任务活动日志表
    await run(`
      CREATE TABLE IF NOT EXISTS task_activities (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 创建默认角色
    await createDefaultRoles();

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  }
}

// 创建默认角色
async function createDefaultRoles() {
  const { v4: uuidv4 } = require('uuid');
  
  // 检查是否已有系统角色
  const existingRoles = await all('SELECT id FROM roles WHERE is_system = 1 LIMIT 1');
  if (existingRoles.length > 0) return;

  const defaultRoles = [
    {
      id: 'role-owner',
      name: 'Owner',
      permissions: JSON.stringify(['*']),
      is_system: 1
    },
    {
      id: 'role-executor',
      name: 'TaskExecutor',
      permissions: JSON.stringify([
        'task:status:change:own',
        'task:comment',
        'task:view'
      ]),
      is_system: 1
    },
    {
      id: 'role-manager',
      name: 'ProjectManager',
      permissions: JSON.stringify([
        'task:status:change',
        'task:comment',
        'task:assign',
        'task:view'
      ]),
      is_system: 1
    }
  ];

  for (const role of defaultRoles) {
    await run(
      'INSERT OR IGNORE INTO roles (id, tenant_id, name, permissions, is_system) VALUES (?, ?, ?, ?, ?)',
      [role.id, 'system', role.name, role.permissions, role.is_system]
    );
  }
}

// ==================== 租户相关 ====================

async function createTenant({ name, subdomain }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  await run(
    'INSERT INTO tenants (id, name, subdomain) VALUES (?, ?, ?)',
    [id, name, subdomain]
  );
  return getTenantById(id);
}

async function getTenantById(id) {
  return get('SELECT * FROM tenants WHERE id = ?', [id]);
}

async function getTenantBySubdomain(subdomain) {
  return get('SELECT * FROM tenants WHERE subdomain = ?', [subdomain]);
}

// ==================== 用户相关 ====================

async function createUser({ tenant_id, email, name, password_hash, avatar }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  await run(
    'INSERT INTO users (id, tenant_id, email, name, password_hash, avatar) VALUES (?, ?, ?, ?, ?, ?)',
    [id, tenant_id, email, name, password_hash, avatar || null]
  );
  return getUserById(id);
}

async function getUserById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}

async function getUserByEmail(tenant_id, email) {
  return get('SELECT * FROM users WHERE tenant_id = ? AND email = ?', [tenant_id, email]);
}

async function updateUserLoginTime(id) {
  await run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
}

// ==================== 组织相关 ====================

async function createGroup({ tenant_id, parent_id, name, level, type, manager_id, description }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  await run(
    'INSERT INTO groups (id, tenant_id, parent_id, name, level, type, manager_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, tenant_id, parent_id || null, name, level, type, manager_id || null, description || null]
  );
  return getGroupById(id);
}

async function getGroupById(id) {
  return get('SELECT * FROM groups WHERE id = ?', [id]);
}

async function getGroupsByTenant(tenant_id) {
  return all('SELECT * FROM groups WHERE tenant_id = ? ORDER BY level, name', [tenant_id]);
}

async function getGroupTree(tenant_id) {
  const groups = await getGroupsByTenant(tenant_id);
  const map = {};
  const tree = [];
  
  groups.forEach(g => {
    map[g.id] = { ...g, children: [] };
  });
  
  groups.forEach(g => {
    if (g.parent_id && map[g.parent_id]) {
      map[g.parent_id].children.push(map[g.id]);
    } else {
      tree.push(map[g.id]);
    }
  });
  
  return tree;
}

async function addGroupMember(group_id, user_id) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  try {
    await run(
      'INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)',
      [id, group_id, user_id]
    );
    return true;
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return false; // 已存在
    }
    throw err;
  }
}

async function removeGroupMember(group_id, user_id) {
  const result = await run(
    'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
    [group_id, user_id]
  );
  return result.changes > 0;
}

async function getGroupMembers(group_id) {
  return all(`
    SELECT u.* FROM users u
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = ?
  `, [group_id]);
}

// ==================== 角色权限相关 ====================

async function createRole({ tenant_id, name, permissions }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  await run(
    'INSERT INTO roles (id, tenant_id, name, permissions, is_system) VALUES (?, ?, ?, ?, 0)',
    [id, tenant_id, name, JSON.stringify(permissions)]
  );
  return getRoleById(id);
}

async function getRoleById(id) {
  const role = await get('SELECT * FROM roles WHERE id = ?', [id]);
  if (role) {
    role.permissions = JSON.parse(role.permissions);
  }
  return role;
}

async function getRolesByTenant(tenant_id) {
  const roles = await all('SELECT * FROM roles WHERE tenant_id = ? OR is_system = 1', [tenant_id]);
  return roles.map(r => ({
    ...r,
    permissions: JSON.parse(r.permissions)
  }));
}

async function assignRole(user_id, role_id, group_id = null) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  try {
    await run(
      'INSERT INTO user_roles (id, user_id, role_id, group_id) VALUES (?, ?, ?, ?)',
      [id, user_id, role_id, group_id]
    );
    return true;
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return false;
    }
    throw err;
  }
}

async function getUserRoles(user_id, tenant_id) {
  const roles = await all(`
    SELECT r.*, ur.group_id FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = ? AND (r.tenant_id = ? OR r.is_system = 1)
  `, [user_id, tenant_id]);
  
  return roles.map(r => ({
    ...r,
    permissions: JSON.parse(r.permissions)
  }));
}

async function checkPermission(user_id, permission, tenant_id) {
  const roles = await getUserRoles(user_id, tenant_id);
  
  for (const role of roles) {
    // Owner拥有所有权限
    if (role.permissions.includes('*')) return true;
    // 检查具体权限
    if (role.permissions.includes(permission)) return true;
    // 检查通配符权限
    const wildcard = permission.split(':').slice(0, -1).join(':') + ':*';
    if (role.permissions.includes(wildcard)) return true;
  }
  
  return false;
}

// ==================== 任务相关（更新版） ====================

async function getTasks({ tenant_id, group_id, page = 1, limit = 20, status, assignee_id, sortBy = 'status', sortOrder = 'asc' }) {
  const offset = (page - 1) * limit;
  const conditions = ['t.tenant_id = ?'];
  const params = [tenant_id];

  if (group_id) {
    conditions.push('t.group_id = ?');
    params.push(group_id);
  }

  if (status) {
    const statuses = status.split(',').filter(s => ['pending', 'in-progress', 'completed'].includes(s));
    if (statuses.length > 0) {
      conditions.push(`t.status IN (${statuses.map(() => '?').join(',')})`);
      params.push(...statuses);
    }
  }

  if (assignee_id) {
    conditions.push('t.assignee_id = ?');
    params.push(assignee_id);
  }

  const whereClause = conditions.join(' AND ');

  // 获取总数
  const countRow = await get(`SELECT COUNT(*) as total FROM tasks t WHERE ${whereClause}`, params);
  const total = countRow.total;
  const totalPages = Math.ceil(total / limit);

  // 构建排序
  let orderClause;
  if (sortBy === 'status') {
    // 默认状态排序：pending(1) -> in-progress(2) -> completed(3)
    orderClause = `
      CASE t.status 
        WHEN 'pending' THEN 1 
        WHEN 'in-progress' THEN 2 
        WHEN 'completed' THEN 3 
      END ${sortOrder.toUpperCase()},
      t.createdAt DESC
    `;
  } else {
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'due_date'];
    const sortField = allowedSortFields.includes(sortBy) ? `t.${sortBy}` : 't.createdAt';
    orderClause = `${sortField} ${sortOrder.toUpperCase()}`;
  }

  // 获取任务列表
  const tasks = await all(`
    SELECT t.*, 
      c.name as creator_name,
      a.name as assignee_name
    FROM tasks t
    LEFT JOIN users c ON t.creator_id = c.id
    LEFT JOIN users a ON t.assignee_id = a.id
    WHERE ${whereClause}
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  return {
    tasks: tasks.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

async function getTaskById(id, tenant_id) {
  const row = await get(`
    SELECT t.*, 
      c.name as creator_name,
      a.name as assignee_name
    FROM tasks t
    LEFT JOIN users c ON t.creator_id = c.id
    LEFT JOIN users a ON t.assignee_id = a.id
    WHERE t.id = ? AND t.tenant_id = ?
  `, [id, tenant_id]);

  if (row) {
    row.tags = row.tags ? row.tags.split(',') : [];
  }
  return row;
}

async function createTask({ tenant_id, group_id, creator_id, assignee_id, title, description, status, priority, tags, due_date }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  const now = new Date().toISOString();
  const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;

  await run(`
    INSERT INTO tasks (id, tenant_id, group_id, creator_id, assignee_id, title, description, status, priority, tags, due_date, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, tenant_id, group_id || null, creator_id, assignee_id || null, title, description || '', status || 'pending', priority || 'medium', tagsStr || '', due_date || null, now, now]);

  // 记录活动
  await logTaskActivity(id, creator_id, 'create', null, JSON.stringify({ title, status }));

  return getTaskById(id, tenant_id);
}

async function updateTask(id, tenant_id, updates, user_id) {
  const fields = [];
  const params = [];
  const now = new Date().toISOString();

  const allowedFields = ['title', 'description', 'status', 'priority', 'tags', 'assignee_id', 'group_id'];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      params.push(key === 'tags' && Array.isArray(value) ? value.join(',') : value);
    }
  }

  if (fields.length === 0) return null;

  fields.push('updatedAt = ?');
  params.push(now);
  params.push(id);
  params.push(tenant_id);

  await run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`, params);

  // 记录活动
  await logTaskActivity(id, user_id, 'update', null, JSON.stringify(updates));

  return getTaskById(id, tenant_id);
}

async function deleteTask(id, tenant_id, user_id) {
  const result = await run('DELETE FROM tasks WHERE id = ? AND tenant_id = ?', [id, tenant_id]);
  
  if (result.changes > 0) {
    await logTaskActivity(id, user_id, 'delete', null, null);
  }
  
  return result.changes > 0;
}

// ==================== 任务评论相关 ====================

async function getTaskComments(task_id) {
  const comments = await all(`
    SELECT tc.*, u.name as author_name, u.avatar as author_avatar
    FROM task_comments tc
    JOIN users u ON tc.author_id = u.id
    WHERE tc.task_id = ?
    ORDER BY tc.createdAt DESC
  `, [task_id]);

  return comments.map(c => ({
    ...c,
    attachments: c.attachments ? JSON.parse(c.attachments) : [],
    mentions: c.mentions ? JSON.parse(c.mentions) : []
  }));
}

async function createComment({ task_id, author_id, parent_id, content, content_type, attachments, mentions }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  const now = new Date().toISOString();

  await run(`
    INSERT INTO task_comments (id, task_id, author_id, parent_id, content, content_type, attachments, mentions, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, task_id, author_id, parent_id || null, content, content_type || 'text', 
      JSON.stringify(attachments || []), JSON.stringify(mentions || []), now, now]);

  return getCommentById(id);
}

async function getCommentById(id) {
  const comment = await get(`
    SELECT tc.*, u.name as author_name, u.avatar as author_avatar
    FROM task_comments tc
    JOIN users u ON tc.author_id = u.id
    WHERE tc.id = ?
  `, [id]);

  if (comment) {
    comment.attachments = JSON.parse(comment.attachments || '[]');
    comment.mentions = JSON.parse(comment.mentions || '[]');
  }
  return comment;
}

async function updateComment(id, content, content_type) {
  await run(
    'UPDATE task_comments SET content = ?, content_type = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [content, content_type, id]
  );
  return getCommentById(id);
}

async function deleteComment(id) {
  const result = await run('DELETE FROM task_comments WHERE id = ?', [id]);
  return result.changes > 0;
}

// ==================== 活动日志相关 ====================

async function logTaskActivity(task_id, user_id, action, old_value, new_value) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  await run(
    'INSERT INTO task_activities (id, task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
    [id, task_id, user_id, action, old_value, new_value]
  );
}

async function getTaskActivities(task_id) {
  return all(`
    SELECT ta.*, u.name as user_name
    FROM task_activities ta
    JOIN users u ON ta.user_id = u.id
    WHERE ta.task_id = ?
    ORDER BY ta.createdAt DESC
  `, [task_id]);
}

// ==================== 标签相关 ====================

async function getAllTags(tenant_id) {
  const rows = await all('SELECT tags FROM tasks WHERE tenant_id = ? AND tags IS NOT NULL AND tags != ""', [tenant_id]);
  
  const tagCount = {};
  rows.forEach(row => {
    const tags = row.tags.split(',').map(t => t.trim()).filter(t => t);
    tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

module.exports = {
  db,
  run, get, all,
  initDatabase,
  
  // 租户
  createTenant, getTenantById, getTenantBySubdomain,
  
  // 用户
  createUser, getUserById, getUserByEmail, updateUserLoginTime,
  
  // 组织
  createGroup, getGroupById, getGroupsByTenant, getGroupTree,
  addGroupMember, removeGroupMember, getGroupMembers,
  
  // 角色权限
  createRole, getRoleById, getRolesByTenant,
  assignRole, getUserRoles, checkPermission,
  
  // 任务
  getTasks, getTaskById, createTask, updateTask, deleteTask,
  
  // 评论
  getTaskComments, createComment, getCommentById, updateComment, deleteComment,
  
  // 活动日志
  logTaskActivity, getTaskActivities,
  
  // 标签
  getAllTags
};
