/**
 * 认证服务
 */

class AuthService {
  private token: string | null = null;
  private user: any = null;

  /**
   * 注册
   */
  async register(email: string, password: string, name: string) {
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
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  }

  /**
   * 登录
   */
  async login(email: string, password: string) {
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
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  /**
   * 登出
   */
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser() {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        this.user = data.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get current user'
      };
    }
  }

  /**
   * 获取 Token
   */
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  /**
   * 获取用户
   */
  getUser() {
    if (!this.user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
    }
    return this.user;
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * 检查是否是管理员
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'ADMIN';
  }

  /**
   * 初始化认证状态
   */
  initialize() {
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }
}

// 创建单例
const authService = new AuthService();

// 初始化
authService.initialize();

export default authService;
