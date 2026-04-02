/**
 * 数据库迁移脚本 - 添加情境成员关联表
 *
 * 此脚本用于添加context_members表，用于管理情境的成员
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const DB_PATH = path.join(__dirname, 'tasks.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database for context_members migration');
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
    console.log('Starting context_members table migration...');

    // 创建情境成员关联表
    console.log('Creating context_members table...');
    await run(`
      CREATE TABLE IF NOT EXISTS context_members (
        id TEXT PRIMARY KEY,
        context_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(context_id, user_id),
        FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ context_members table created');

    // 创建索引
    console.log('Creating indexes...');
    await run('CREATE INDEX IF NOT EXISTS idx_context_members_context_id ON context_members(context_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_context_members_user_id ON context_members(user_id)');
    console.log('✓ Indexes created');

    console.log('\n========================================');
    console.log('✓ context_members migration completed!');
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
