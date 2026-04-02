/**
 * TaskManager v2.2 数据库迁移脚本
 *
 * 新增功能:
 * 1. 情境（Context）管理
 * 2. 任务角色扩展（报告人、验证人）
 * 3. 任务预计耗时
 * 4. 任务收藏功能
 * 5. 用户信息扩展（昵称、描述）
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 数据库路径
const DB_PATH = path.join(__dirname, 'tasks.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database for v2.2 migration');
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

// 获取表信息
function getTableInfo(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// 检查列是否存在
function hasColumn(tableInfo, columnName) {
  return tableInfo.some(col => col.name === columnName);
}

// 执行迁移
async function migrate() {
  try {
    console.log('Starting v2.2 database migration...');

    // 1. 创建情境（Context）表
    console.log('Creating contexts table...');
    await run(`
      CREATE TABLE IF NOT EXISTS contexts (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        avatar TEXT,
        owner_id TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Contexts table created');

    // 2. 为tasks表添加context_id列
    console.log('Adding context_id column to tasks table...');
    const tasksTableInfo = await getTableInfo('tasks');

    if (!hasColumn(tasksTableInfo, 'context_id')) {
      await run('ALTER TABLE tasks ADD COLUMN context_id TEXT');
      await run('CREATE INDEX IF NOT EXISTS idx_tasks_context_id ON tasks(context_id)');
      console.log('✓ Added context_id column to tasks table');
    } else {
      console.log('✓ context_id column already exists');
    }

    // 3. 为tasks表添加reporter_id列
    console.log('Adding reporter_id column to tasks table...');
    if (!hasColumn(tasksTableInfo, 'reporter_id')) {
      await run('ALTER TABLE tasks ADD COLUMN reporter_id TEXT');
      await run('CREATE INDEX IF NOT EXISTS idx_tasks_reporter_id ON tasks(reporter_id)');
      console.log('✓ Added reporter_id column to tasks table');
    } else {
      console.log('✓ reporter_id column already exists');
    }

    // 4. 为tasks表添加verifier_id列
    console.log('Adding verifier_id column to tasks table...');
    if (!hasColumn(tasksTableInfo, 'verifier_id')) {
      await run('ALTER TABLE tasks ADD COLUMN verifier_id TEXT');
      await run('CREATE INDEX IF NOT EXISTS idx_tasks_verifier_id ON tasks(verifier_id)');
      console.log('✓ Added verifier_id column to tasks table');
    } else {
      console.log('✓ verifier_id column already exists');
    }

    // 5. 为tasks表添加estimated_time列
    console.log('Adding estimated_time column to tasks table...');
    if (!hasColumn(tasksTableInfo, 'estimated_time')) {
      await run('ALTER TABLE tasks ADD COLUMN estimated_time TEXT');
      console.log('✓ Added estimated_time column to tasks table');
    } else {
      console.log('✓ estimated_time column already exists');
    }

    // 6. 为tasks表添加is_favorite列
    console.log('Adding is_favorite column to tasks table...');
    if (!hasColumn(tasksTableInfo, 'is_favorite')) {
      await run('ALTER TABLE tasks ADD COLUMN is_favorite INTEGER DEFAULT 0');
      await run('CREATE INDEX IF NOT EXISTS idx_tasks_is_favorite ON tasks(is_favorite)');
      console.log('✓ Added is_favorite column to tasks table');
    } else {
      console.log('✓ is_favorite column already exists');
    }

    // 7. 为users表添加nickname列
    console.log('Adding nickname column to users table...');
    const usersTableInfo = await getTableInfo('users');

    if (!hasColumn(usersTableInfo, 'nickname')) {
      await run('ALTER TABLE users ADD COLUMN nickname TEXT');
      console.log('✓ Added nickname column to users table');
    } else {
      console.log('✓ nickname column already exists');
    }

    // 8. 为users表添加description列
    console.log('Adding description column to users table...');
    if (!hasColumn(usersTableInfo, 'description')) {
      await run('ALTER TABLE users ADD COLUMN description TEXT');
      console.log('✓ Added description column to users table');
    } else {
      console.log('✓ description column already exists');
    }

    // 9. 为users表添加third_party_account列
    console.log('Adding third_party_account column to users table...');
    if (!hasColumn(usersTableInfo, 'third_party_account')) {
      await run('ALTER TABLE users ADD COLUMN third_party_account TEXT');
      console.log('✓ Added third_party_account column to users table');
    } else {
      console.log('✓ third_party_account column already exists');
    }

    // 10. 创建默认情境（示例数据）
    console.log('Creating default contexts...');
    const existingContexts = await run('SELECT COUNT(*) as count FROM contexts');
    if (existingContexts.count === 0) {
      // 为第一个租户和第一个用户创建默认情境
      const defaultTenant = await run('SELECT id FROM tenants LIMIT 1');
      const defaultUser = await run('SELECT id FROM users LIMIT 1');

      if (defaultTenant && defaultUser) {
        await run(`
          INSERT INTO contexts (id, tenant_id, name, description, owner_id)
          VALUES (?, ?, ?, ?, ?)
        `, [uuidv4(), defaultTenant.id, '默认项目', '这是您的默认项目情境', defaultUser.id]);
        console.log('✓ Default context created');
      }
    } else {
      console.log('✓ Default contexts already exist');
    }

    // 11. 更新现有任务的context_id（如果没有设置）
    console.log('Updating existing tasks with default context...');
    await run(`
      UPDATE tasks
      SET context_id = (SELECT id FROM contexts LIMIT 1)
      WHERE context_id IS NULL
    `);
    console.log('✓ Existing tasks updated with default context');

    console.log('\n========================================');
    console.log('✓ v2.2 database migration completed!');
    console.log('========================================');

  } catch (err) {
    console.error('\n========================================');
    console.error('✗ Migration failed:', err.message);
    console.error('========================================');
    throw err;
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// 执行迁移
migrate()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration script failed:', err);
    process.exit(1);
  });
