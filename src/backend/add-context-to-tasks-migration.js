/**
 * v2.2 后续迁移：添加context_id字段到tasks表
 *
 * 执行方式：node add-context-to-tasks-migration.js
 */

const { initDatabase, run } = require('./database');

async function migrate() {
  try {
    await initDatabase();

    console.log('开始添加context_id字段到tasks表...');

    // 检查字段是否已存在
    const { run: runDb } = require('sqlite3');
    const path = require('path');
    const dbPath = path.join(__dirname, 'tasks.db');
    const sqlite3 = require('sqlite3').verbose();

    const db = new sqlite3.Database(dbPath);

    // 获取表结构
    db.all("PRAGMA table_info(tasks)", (err, rows) => {
      if (err) {
        console.error('获取表结构失败:', err);
        return;
      }

      const hasContextField = rows.some(row => row.name === 'context_id');

      if (hasContextField) {
        console.log('✅ context_id字段已存在，无需迁移');
        db.close();
        return;
      }

      // 添加context_id字段
      run(`
        ALTER TABLE tasks
        ADD COLUMN context_id TEXT
      `).then(() => {
        console.log('✅ 成功添加context_id字段到tasks表');

        // 添加外键约束（注意：SQLite不支持直接添加外键，需要在重建表时添加）
        console.log('⚠️  注意：SQLite不支持直接添加外键约束');
        console.log('⚠️  外键约束需要在下次重建tasks表时添加');

        db.close();
      }).catch((error) => {
        console.error('❌ 添加字段失败:', error);
        db.close();
      });
    });

  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

// 执行迁移
migrate();
