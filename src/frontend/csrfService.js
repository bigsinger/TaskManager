/**
 * CSRF 服务
 */

class CsrfService {
  constructor() {
    this.csrfToken = null;
  }

  /**
   * 获取 CSRF Token
   */
  async getCsrfToken() {
    try {
      const response = await fetch('/api/csrf-token');
      const data = await response.json();

      if (data.success) {
        this.csrfToken = data.data.csrfToken;
        this.updateMetaTag();
        return this.csrfToken;
      }

      return null;
    } catch (error) {
      console.error('获取 CSRF Token 失败:', error);
      return null;
    }
  }

  /**
   * 更新 meta 标签
   */
  updateMetaTag() {
    let metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'csrf-token');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', this.csrfToken || '');
  }

  /**
   * 获取当前 Token
   */
  getToken() {
    return this.csrfToken;
  }

  /**
   * 初始化
   */
  init() {
    // 从 meta 标签加载
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      this.csrfToken = metaTag.getAttribute('content');
    }
    return Promise.resolve();
  }

  /**
   * 初始化（别名）
   */
  initialize() {
    return this.init();
  }
}

// 创建单例
const csrfService = new CsrfService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CsrfService, csrfService };
}
