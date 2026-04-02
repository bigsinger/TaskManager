/**
 * 情境（Context）Service
 *
 * 负责情境的业务逻辑
 */

const contextsRepository = require('../repositories/contexts.repository');
const { v4: uuidv4 } = require('uuid');

class ContextsService {
  /**
   * 获取用户的所有情境
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 情境列表
   */
  async getUserContexts(userId) {
    try {
      const contexts = await contextsRepository.findByUserId(userId);
      return {
        success: true,
        data: contexts,
        message: '获取情境列表成功',
      };
    } catch (error) {
      console.error('获取用户情境失败:', error);
      throw new Error('获取情境列表失败');
    }
  }

  /**
   * 根据ID获取情境
   * @param {string} id - 情境ID
   * @returns {Promise<Object>} 情境对象
   */
  async getContextById(id) {
    try {
      const context = await contextsRepository.findById(id);

      if (!context) {
        return {
          success: false,
          message: '情境不存在',
        };
      }

      return {
        success: true,
        data: context,
      };
    } catch (error) {
      console.error('获取情境失败:', error);
      throw new Error('获取情境失败');
    }
  }

  /**
   * 创建新情境
   * @param {Object} contextData - 情境数据
   * @returns {Promise<Object>} 创建的情境
   */
  async createContext(contextData, userId, tenantId) {
    try {
      // 验证必填字段
      if (!contextData.name || contextData.name.trim() === '') {
        return {
          success: false,
          message: '情境名称不能为空',
        };
      }

      // 创建情境对象
      const context = {
        id: uuidv4(),
        tenant_id: tenantId,
        name: contextData.name.trim(),
        description: contextData.description || '',
        avatar: contextData.avatar || '',
        owner_id: userId,
        is_public: contextData.is_public || false,
      };

      // 保存到数据库
      const createdContext = await contextsRepository.create(context);

      // 添加创建者到情境成员
      await contextsRepository.addMember(createdContext.id, userId);

      return {
        success: true,
        data: createdContext,
        message: '创建情境成功',
      };
    } catch (error) {
      console.error('创建情境失败:', error);
      throw new Error('创建情境失败');
    }
  }

  /**
   * 更新情境
   * @param {string} id - 情境ID
   * @param {Object} updates - 更新的字段
   * @param {string} userId - 当前用户ID
   * @returns {Promise<Object>} 更新后的情境
   */
  async updateContext(id, updates, userId) {
    try {
      // 检查情境是否存在
      const context = await contextsRepository.findById(id);
      if (!context) {
        return {
          success: false,
          message: '情境不存在',
        };
      }

      // 检查权限（只有所有者可以修改）
      if (context.owner_id !== userId) {
        return {
          success: false,
          message: '只有情境所有者可以修改',
        };
      }

      // 验证情境名称
      if (updates.name !== undefined && updates.name.trim() === '') {
        return {
          success: false,
          message: '情境名称不能为空',
        };
      }

      // 更新情境
      const updatedContext = await contextsRepository.update(id, updates);

      return {
        success: true,
        data: updatedContext,
        message: '更新情境成功',
      };
    } catch (error) {
      console.error('更新情境失败:', error);
      throw new Error('更新情境失败');
    }
  }

  /**
   * 删除情境
   * @param {string} id - 情境ID
   * @param {string} userId - 当前用户ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteContext(id, userId) {
    try {
      // 检查情境是否存在
      const context = await contextsRepository.findById(id);
      if (!context) {
        return {
          success: false,
          message: '情境不存在',
        };
      }

      // 检查权限（只有所有者可以删除）
      if (context.owner_id !== userId) {
        return {
          success: false,
          message: '只有情境所有者可以删除',
        };
      }

      // 删除情境
      await contextsRepository.delete(id);

      return {
        success: true,
        message: '删除情境成功',
      };
    } catch (error) {
      console.error('删除情境失败:', error);
      throw new Error('删除情境失败');
    }
  }

  /**
   * 获取情境的成员列表
   * @param {string} contextId - 情境ID
   * @returns {Promise<Array>} 成员列表
   */
  async getContextMembers(contextId) {
    try {
      const members = await contextsRepository.getMembers(contextId);
      return {
        success: true,
        data: members,
      };
    } catch (error) {
      console.error('获取情境成员失败:', error);
      throw new Error('获取情境成员失败');
    }
  }

  /**
   * 添加情境成员
   * @param {string} contextId - 情境ID
   * @param {string} userId - 用户ID
   * @param {string} currentUserId - 当前用户ID
   * @returns {Promise<Object>} 结果
   */
  async addContextMember(contextId, userId, currentUserId) {
    try {
      // 检查情境是否存在
      const context = await contextsRepository.findById(contextId);
      if (!context) {
        return {
          success: false,
          message: '情境不存在',
        };
      }

      // 检查权限（只有所有者可以添加成员）
      if (context.owner_id !== currentUserId) {
        return {
          success: false,
          message: '只有情境所有者可以添加成员',
        };
      }

      // 添加成员
      await contextsRepository.addMember(contextId, userId);

      return {
        success: true,
        message: '添加成员成功',
      };
    } catch (error) {
      console.error('添加情境成员失败:', error);
      throw new Error('添加情境成员失败');
    }
  }

  /**
   * 移除情境成员
   * @param {string} contextId - 情境ID
   * @param {string} userId - 用户ID
   * @param {string} currentUserId - 当前用户ID
   * @returns {Promise<Object>} 结果
   */
  async removeContextMember(contextId, userId, currentUserId) {
    try {
      // 检查情境是否存在
      const context = await contextsRepository.findById(contextId);
      if (!context) {
        return {
          success: false,
          message: '情境不存在',
        };
      }

      // 检查权限（只有所有者可以移除成员）
      if (context.owner_id !== currentUserId) {
        return {
          success: false,
          message: '只有情境所有者可以移除成员',
        };
      }

      // 不能移除所有者
      if (userId === context.owner_id) {
        return {
          success: false,
          message: '不能移除情境所有者',
        };
      }

      // 移除成员
      await contextsRepository.removeMember(contextId, userId);

      return {
        success: true,
        message: '移除成员成功',
      };
    } catch (error) {
      console.error('移除情境成员失败:', error);
      throw new Error('移除情境成员失败');
    }
  }
}

module.exports = new ContextsService();
