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

// 初始化数据库表
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        tags TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        reject(err);
      } else {
        console.log('Database initialized successfully');
        resolve();
      }
    });
  });
}

// 获取所有任务（支持分页、筛选、排序）
function getTasks({ page = 1, limit = 20, status, tags, sort = 'createdAt', order = 'desc' }) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];

    // 构建筛选条件
    const conditions = [];
    
    if (status) {
      const statuses = status.split(',').filter(s => ['pending', 'in-progress', 'completed'].includes(s));
      if (statuses.length > 0) {
        conditions.push(`status IN (${statuses.map(() => '?').join(',')})`);
        params.push(...statuses);
      }
    }

    if (tags) {
      const tagList = tags.split(',');
      tagList.forEach(tag => {
        conditions.push('tags LIKE ?');
        params.push(`%${tag}%`);
      });
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // 验证排序字段
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM tasks ${whereClause}`;
    db.get(countSql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      const total = row.total;
      const totalPages = Math.ceil(total / limit);

      // 获取任务列表
      const sql = `SELECT * FROM tasks ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
      const queryParams = [...params, limit, offset];

      db.all(sql, queryParams, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // 解析tags字段
        const tasks = rows.map(row => ({
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        }));

        resolve({
          tasks,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });
      });
    });
  });
}

// 获取单个任务
function getTaskById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row) {
        resolve({
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        });
      } else {
        resolve(null);
      }
    });
  });
}

// 创建任务
function createTask({ title, description = '', status = 'pending', tags = [] }) {
  return new Promise((resolve, reject) => {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const now = new Date().toISOString();
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;

    const sql = `INSERT INTO tasks (id, title, description, status, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [id, title, description, status, tagsStr, now, now], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      resolve({
        id,
        title,
        description,
        status,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        createdAt: now,
        updatedAt: now
      });
    });
  });
}

// 更新任务
function updateTask(id, { title, description, status, tags }) {
  return new Promise((resolve, reject) => {
    const updates = [];
    const params = [];
    const now = new Date().toISOString();

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(Array.isArray(tags) ? tags.join(',') : tags);
    }

    updates.push('updatedAt = ?');
    params.push(now);
    params.push(id);

    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }

      if (this.changes === 0) {
        resolve(null);
        return;
      }

      // 返回更新后的任务
      getTaskById(id).then(resolve).catch(reject);
    });
  });
}

// 删除任务
function deleteTask(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}

// 获取所有标签
function getAllTags() {
  return new Promise((resolve, reject) => {
    db.all('SELECT tags FROM tasks WHERE tags IS NOT NULL AND tags != ""', [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const tagCount = {};
      rows.forEach(row => {
        const tags = row.tags.split(',').map(t => t.trim()).filter(t => t);
        tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      const tags = Object.entries(tagCount).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => b.count - a.count);

      resolve(tags);
    });
  });
}

module.exports = {
  db,
  initDatabase,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAllTags
};