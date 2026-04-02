/**
 * 情境（Context）Repository
 *
 * 负责数据库中contexts表的CRUD操作
 */

const db = require('../../../database');

class ContextsRepository {
  /**
   * 获取用户的所有情境
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 情境列表
   */
  async findByUserId(userId) {
    const sql = `
      SELECT
        c.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.context_id = c.id) as task_count,
        (SELECT COUNT(*) FROM context_members cm WHERE cm.context_id = c.id) as member_count
      FROM contexts c
      WHERE c.tenant_id = (SELECT tenant_id FROM users WHERE id = ?)
      ORDER BY c.created_at DESC
    `;

    return new Promise((resolve, reject) => {
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * 根据ID获取情境
   * @param {string} id - 情境ID
   * @returns {Promise<Object|null>} 情境对象
   */
  async findById(id) {
    const sql = `
      SELECT
        c.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.context_id = c.id) as task_count,
        (SELECT COUNT(*) FROM context_members cm WHERE cm.context_id = c.id) as member_count
      FROM contexts c
      WHERE c.id = ?
    `;

    return new Promise((resolve, reject) => {
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  /**
   * 创建新情境
   * @param {Object} context - 情境对象
   * @returns {Promise<Object>} 创建的情境
   */
  async create(context) {
    const sql = `
      INSERT INTO contexts (id, tenant_id, name, description, avatar, owner_id, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      context.id,
      context.tenant_id,
      context.name,
      context.description || null,
      context.avatar || null,
      context.owner_id,
      context.is_public ? 1 : 0,
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else {
          resolve({
            id: context.id,
            ...context,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });
    });
  }

  /**
   * 更新情境
   * @param {string} id - 情境ID
   * @param {Object} updates - 更新的字段
   * @returns {Promise<Object>} 更新后的情境
   */
  async update(id, updates) {
    const fields = [];
    const params = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      params.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      params.push(updates.description);
    }

    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      params.push(updates.avatar);
    }

    if (updates.is_public !== undefined) {
      fields.push('is_public = ?');
      params.push(updates.is_public ? 1 : 0);
    }

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const sql = `UPDATE contexts SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else {
          // 返回更新后的对象
          resolve({ id, ...updates, updated_at: new Date().toISOString() });
        }
      });
    });
  }

  /**
   * 删除情境
   * @param {string} id - 情境ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const sql = 'DELETE FROM contexts WHERE id = ?';

    return new Promise((resolve, reject) => {
      db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 获取情境的成员
   * @param {string} contextId - 情境ID
   * @returns {Promise<Array>} 成员列表
   */
  async getMembers(contextId) {
    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.nickname,
        u.avatar,
        cm.joined_at
      FROM context_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.context_id = ?
      ORDER BY cm.joined_at ASC
    `;

    return new Promise((resolve, reject) => {
      db.all(sql, [contextId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * 添加情境成员
   * @param {string} contextId - 情境ID
   * @param {string} userId - 用户ID
   * @returns {Promise<void>}
   */
  async addMember(contextId, userId) {
    const { v4: uuidv4 } = require('uuid');
    const sql = `
      INSERT INTO context_members (id, context_id, user_id)
      VALUES (?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.run(sql, [uuidv4(), contextId, userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 移除情境成员
   * @param {string} contextId - 情境ID
   * @param {string} userId - 用户ID
   * @returns {Promise<void>}
   */
  async removeMember(contextId, userId) {
    const sql = 'DELETE FROM context_members WHERE context_id = ? AND user_id = ?';

    return new Promise((resolve, reject) => {
      db.run(sql, [contextId, userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new ContextsRepository();
