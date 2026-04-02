/**
 * 用户头像组件
 *
 * 显示用户头像和昵称
 */

class UserAvatar {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      size: options.size || 'medium', // small, medium, large
      clickable: options.clickable !== false,
      onClick: options.onClick || (() => {}),
      ...options
    };

    this.user = null;

    this.init();
  }

  async init() {
    if (!this.container) {
      console.error('UserAvatar: Container not found');
      return;
    }

    await this.loadUserInfo();
    this.render();
  }

  async loadUserInfo() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load user info');
      }

      const result = await response.json();
      this.user = result.user;
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  }

  render() {
    if (!this.user) {
      this.container.innerHTML = this.renderAvatar('用户', null);
      return;
    }

    const name = this.user.nickname || this.user.name || '用户';
    const avatar = this.user.avatar || null;

    this.container.innerHTML = this.renderAvatar(name, avatar);
    this.bindEvents();
  }

  renderAvatar(name, avatar) {
    const sizeClass = `avatar-${this.options.size}`;
    const clickableClass = this.options.clickable ? 'avatar-clickable' : '';

    return `
      <div class="user-avatar ${sizeClass} ${clickableClass}">
        ${avatar ? 
          `<img src="${avatar}" alt="${name}" class="avatar-image">` :
          `<div class="avatar-placeholder">${name.charAt(0)}</div>`
        }
        <div class="avatar-info">
          <span class="avatar-name">${name}</span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    if (this.options.clickable) {
      const avatarEl = this.container.querySelector('.user-avatar');
      avatarEl.addEventListener('click', () => {
        this.options.onClick(this.user);
      });
    }
  }

  async refresh() {
    await this.loadUserInfo();
    this.render();
  }

  setUser(user) {
    this.user = user;
    this.render();
  }
}

// 导出为全局变量
window.UserAvatar = UserAvatar;
