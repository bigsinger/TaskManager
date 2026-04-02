/**
 * 添加is_favorite字段到tasks表
 *
 * 执行方式：node add-favorite-to-tasks-migration.js
 */

const { initDatabase, run } = require('./database');

async function migrate() {
  try {
    await initDatabase();

    console.log('开始添加is_favorite字段到tasks表...');

    // 检查字段是否已存在
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, 'tasks.db');
    const db = new sqlite3.Database(dbPath);

    db.all("PRAGMA table_info(tasks)", (err, rows) => {
      if (err) {
        console.error('获取表结构失败:', err);
        return;
      }

      const hasFavoriteField = rows.some(row => row.name === 'is_favorite');

      if (hasFavoriteField) {
        console.log('✅ is_favorite字段已存在，无需迁移');
        db.close();
        return;
      }

      // 添加is_favorite字段
      run(`
        ALTER TABLE tasks
        ADD COLUMN is_favorite INTEGER DEFAULT 0
      `).then(() => {
        console.log('✅ 成功添加is_favorite字段到tasks表');
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
