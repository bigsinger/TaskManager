/**
 * 认证服务
 */

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
  }

  /**
   * 注册
   */
  async register(email, password, name) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        this.saveToken();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, error: '注册失败，请稍后重试' };
    }
  }

  /**
   * 登录
   */
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        this.saveToken();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, error: '登录失败，请稍后重试' };
    }
  }

  /**
   * 登出
   */
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * 保存Token到本地存储
   */
  saveToken() {
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
    }
    if (this.user) {
      localStorage.setItem('auth_user', JSON.stringify(this.user));
    }
  }

  /**
   * 从本地存储加载Token
   */
  loadToken() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token) {
      this.token = token;
    }
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
  }

  /**
   * 获取Token
   */
  getToken() {
    return this.token;
  }

  /**
   * 获取当前用户
   */
  getUser() {
    return this.user;
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return !!this.token;
  }

  /**
   * 检查是否已认证（别名）
   */
  isAuthenticated() {
    return this.isLoggedIn();
  }

  /**
   * 验证Token
   */
  async verifyToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('验证Token失败:', error);
      return false;
    }
  }
}

// 创建单例
const authService = new AuthService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthService, authService };
}
