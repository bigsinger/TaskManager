const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, getTasks, getTaskById, createTask, updateTask, deleteTask, getAllTags } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../frontend')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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