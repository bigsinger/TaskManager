// 数据库修复脚本
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'tasks.db');
const db = new sqlite3.Database(DB_PATH);

async function fixDatabase() {
  console.log('开始修复数据库...');

  // 检查表结构
  db.all("PRAGMA table_info(tasks)", (err, rows) => {
    if (err) {
      console.error('获取表结构失败:', err);
      process.exit(1);
    }

    console.log('\ntasks表当前字段:');
    rows.forEach(row => console.log(`  - ${row.name} (${row.type})`));

    const hasTenantId = rows.some(row => row.name === 'tenant_id');
    const hasCreatorId = rows.some(row => row.name === 'creator_id');
    const hasAssigneeId = rows.some(row => row.name === 'assignee_id');
    const hasGroupId = rows.some(row => row.name === 'group_id');
    const hasPriority = rows.some(row => row.name === 'priority');

    if (hasCreatorId) {
      console.log('\n✓ 数据库已是v2.1版本，无需修复');
      db.close();
      process.exit(0);
    }

    console.log('\n✗ 数据库需要迁移到v2.1版本');

    db.serialize(() => {
      // 备份当前数据
      console.log('\n1. 备份当前任务数据...');
      db.all("SELECT * FROM tasks", (err, tasks) => {
        if (err) {
          console.error('备份数据失败:', err);
          process.exit(1);
        }

        console.log(`   已备份 ${tasks.length} 条任务`);

        // 删除旧表
        console.log('\n2. 删除旧表...');
        db.run("DROP TABLE IF EXISTS tasks", (err) => {
          if (err) {
            console.error('删除表失败:', err);
            process.exit(1);
          }

          console.log('   ✓ 旧表已删除');

          // 创建新表（v2.1结构）
          console.log('\n3. 创建新表（v2.1结构）...');
          db.run(`
            CREATE TABLE tasks (
              id TEXT PRIMARY KEY,
              tenant_id TEXT NOT NULL,
              group_id TEXT,
              creator_id TEXT NOT NULL,
              assignee_id TEXT,
              title TEXT NOT NULL,
              description TEXT,
              status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed')),
              priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
              tags TEXT,
              due_date DATETIME,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
              FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
              FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
            )
          `, (err) => {
            if (err) {
              console.error('创建表失败:', err);
              process.exit(1);
            }

            console.log('   ✓ 新表已创建');

            // 恢复数据（使用默认值填充新字段）
            console.log('\n4. 恢复数据...');
            const defaultTenantId = 'default-tenant';
            let restored = 0;

            tasks.forEach(task => {
              const newTask = {
                id: task.id,
                tenant_id: defaultTenantId,
                group_id: task.group_id || null,
                creator_id: task.creator_id || 'default-user',
                assignee_id: task.assignee_id || null,
                title: task.title,
                description: task.description,
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                tags: task.tags,
                due_date: task.due_date,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt
              };

              db.run(`
                INSERT INTO tasks (
                  id, tenant_id, group_id, creator_id, assignee_id,
                  title, description, status, priority, tags, due_date,
                  createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, Object.values(newTask), (err) => {
                if (err) {
                  console.error(`   恢复任务 ${task.id} 失败:`, err);
                } else {
                  restored++;
                }
              });
            });

            setTimeout(() => {
              console.log(`   ✓ 已恢复 ${restored} 条任务`);
              console.log('\n✓ 数据库修复完成！\n');
              db.close();
              process.exit(0);
            }, 500);
          });
        });
      });
    });
  });
}

fixDatabase();
