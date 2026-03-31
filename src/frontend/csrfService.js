/**
 * CSRF 服务
 */

class CsrfService {
  private csrfToken: string | null = null;

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
      console.error('Failed to get CSRF token:', error);
      return null;
    }
  }

  /**
   * 获取当前 CSRF Token
   */
  getToken() {
    if (!this.csrfToken) {
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        this.csrfToken = metaTag.getAttribute('content');
      }
    }
    return this.csrfToken;
  }

  /**
   * 更新 Meta 标签
   */
  private updateMetaTag() {
    let metaTag = document.querySelector('meta[name="csrf-token"]');

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'csrf-token';
      document.head.appendChild(metaTag);
    }

    if (metaTag && this.csrfToken) {
      metaTag.setAttribute('content', this.csrfToken);
    }
  }

  /**
   * 初始化 CSRF Token
   */
  async initialize() {
    await this.getCsrfToken();
  }
}

// 创建单例
const csrfService = new CsrfService();

export default csrfService;
