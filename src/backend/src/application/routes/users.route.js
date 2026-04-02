/**
 * 用户API路由
 *
 * 提供用户相关的API端点
 */

const express = require('express');
const router = express.Router();
const { getUserById, getGroupsByUser, getGroupTree, getUserRoles, run, get } = require('../../../database');
const { v4: uuidv4 } = require('uuid');

// 认证中间件
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// 所有路由都需要认证
router.use(authenticate);

/**
 * GET /api/users/profile
 * 获取当前用户的详细信息
 */
router.get('/profile', async (req, res, next) => {
  try {
    const { id: userId, tenant_id } = req.user;

    // 获取用户信息
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 获取用户角色
    const roles = await getUserRoles(userId, tenant_id);

    // 获取用户组织
    const groups = await getGroupsByUser(userId, tenant_id);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname || user.name,
        description: user.description || '',
        avatar: user.avatar || '',
        third_party_account: user.third_party_account || '',
        created_at: user.created_at,
        roles: roles || [],
        organizations: groups || []
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    next(error);
  }
});

/**
 * PUT /api/users/profile
 * 更新当前用户的信息
 */
router.put('/profile', async (req, res, next) => {
  try {
    const { id: userId, tenant_id } = req.user;
    const { nickname, description } = req.body;

    // 获取用户信息
    const existingUser = await getUserById(userId);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 验证昵称长度
    if (nickname !== undefined && nickname.trim() === '') {
      return res.status(400).json({ error: '昵称不能为空' });
    }

    if (nickname !== undefined && nickname.length > 50) {
      return res.status(400).json({ error: '昵称不能超过50个字符' });
    }

    // 验证描述长度
    if (description !== undefined && description.length > 500) {
      return res.status(400).json({ error: '描述不能超过500个字符' });
    }

    // 更新用户信息
    const updates = {};
    if (nickname !== undefined) updates.nickname = nickname.trim();
    if (description !== undefined) updates.description = description;

    const fields = [];
    const params = [];

    if (updates.nickname !== undefined) {
      fields.push('nickname = ?');
      params.push(updates.nickname);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      params.push(updates.description);
    }

    if (fields.length > 0) {
      params.push(userId);
      await run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
    }

    // 获取更新后的用户信息
    const updatedUser = await getUserById(userId);
    const roles = await getUserRoles(userId, tenant_id);

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        nickname: updatedUser.nickname || updatedUser.name,
        description: updatedUser.description || '',
        avatar: updatedUser.avatar || '',
        third_party_account: updatedUser.third_party_account || '',
        created_at: updatedUser.created_at,
        roles: roles || []
      },
      message: '更新用户信息成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    next(error);
  }
});

/**
 * GET /api/users/:id/organizations
 * 获取用户的组织架构
 */
router.get('/:id/organizations', async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { id: currentUserId, tenant_id } = req.user;

    // 只能查看自己的组织
    if (userId !== currentUserId) {
      return res.status(403).json({ error: '没有权限查看其他用户的组织' });
    }

    // 获取用户组织
    const groups = await getGroupsByUser(userId, tenant_id);

    res.json({
      success: true,
      data: groups || []
    });
  } catch (error) {
    console.error('获取用户组织失败:', error);
    next(error);
  }
});

/**
 * GET /api/users/:id/roles
 * 获取用户的角色
 */
router.get('/:id/roles', async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { id: currentUserId, tenant_id } = req.user;

    // 只能查看自己的角色
    if (userId !== currentUserId) {
      return res.status(403).json({ error: '没有权限查看其他用户的角色' });
    }

    // 获取用户角色
    const roles = await getUserRoles(userId, tenant_id);

    res.json({
      success: true,
      data: roles || []
    });
  } catch (error) {
    console.error('获取用户角色失败:', error);
    next(error);
  }
});

/**
 * GET /api/users/:id/stats
 * 获取用户的统计数据
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { id: currentUserId, tenant_id } = req.user;

    // 只能查看自己的统计
    if (userId !== currentUserId) {
      return res.status(403).json({ error: '没有权限查看其他用户的统计' });
    }

    // 总任务数
    const totalTasksRow = await get(
      'SELECT COUNT(*) as count FROM tasks WHERE tenant_id = ?',
      [tenant_id]
    );
    const totalTasks = totalTasksRow ? totalTasksRow.count : 0;

    // 完成的任务数
    const completedTasksRow = await get(
      "SELECT COUNT(*) as count FROM tasks WHERE tenant_id = ? AND status = 'completed'",
      [tenant_id]
    );
    const completedTasks = completedTasksRow ? completedTasksRow.count : 0;

    // 创建的任务数
    const createdTasksRow = await get(
      'SELECT COUNT(*) as count FROM tasks WHERE tenant_id = ? AND creator_id = ?',
      [tenant_id, userId]
    );
    const createdTasks = createdTasksRow ? createdTasksRow.count : 0;

    // 收藏的任务数
    const favoriteTasksRow = await get(
      'SELECT COUNT(*) as count FROM tasks WHERE tenant_id = ? AND is_favorite = 1',
      [tenant_id]
    );
    const favoriteTasks = favoriteTasksRow ? favoriteTasksRow.count : 0;

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        createdTasks,
        favoriteTasks
      }
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    next(error);
  }
});

module.exports = router;
