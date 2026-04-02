/**
 * 情境（Context）路由
 *
 * 提供情境相关的API端点
 */

const express = require('express');
const router = express.Router();
const contextsService = require('../../domain/services/contexts.service');
const { authenticate } = require('../../middleware/auth.middleware');

// 所有路由都需要认证
router.use(authenticate);

/**
 * GET /api/contexts
 * 获取当前用户的所有情境
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await contextsService.getUserContexts(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/contexts/:id
 * 根据ID获取情境
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await contextsService.getContextById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/contexts
 * 创建新情境
 */
router.post('/', async (req, res, next) => {
  try {
    const result = await contextsService.createContext(
      req.body,
      req.user.id,
      req.user.tenant_id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/contexts/:id
 * 更新情境
 */
router.put('/:id', async (req, res, next) => {
  try {
    const result = await contextsService.updateContext(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/contexts/:id
 * 删除情境
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await contextsService.deleteContext(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/contexts/:id/members
 * 获取情境的成员列表
 */
router.get('/:id/members', async (req, res, next) => {
  try {
    const result = await contextsService.getContextMembers(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/contexts/:id/members/:userId
 * 添加情境成员
 */
router.post('/:id/members/:userId', async (req, res, next) => {
  try {
    const result = await contextsService.addContextMember(
      req.params.id,
      req.params.userId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/contexts/:id/members/:userId
 * 移除情境成员
 */
router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const result = await contextsService.removeContextMember(
      req.params.id,
      req.params.userId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
