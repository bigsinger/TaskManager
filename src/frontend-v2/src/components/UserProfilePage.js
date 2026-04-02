/**
 * 用户个人中心页面
 *
 * 显示用户信息、组织架构、角色信息和统计数据
 */

class UserProfilePage {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.user = null;
    this.organizations = [];
    this.roles = [];
    this.stats = {};
    this.activeTab = 'profile'; // profile, organizations, roles, stats

    this.init();
  }

  async init() {
    if (!this.container) {
      console.error('UserProfilePage: Container not found');
      return;
    }

    await this.loadAllData();
    this.render();
    this.bindEvents();
  }

  async loadAllData() {
    try {
      const token = localStorage.getItem('token');

      // 加载用户信息
      const profileResponse = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const profileResult = await profileResponse.json();
      this.user = profileResult.data;

      // 加载组织信息
      const orgsResponse = await fetch('/api/users/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const orgsResult = await orgsResponse.json();
      this.organizations = orgsResult.data || [];

      // 加载角色信息
      const rolesResponse = await fetch('/api/users/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const rolesResult = await rolesResponse.json();
      this.roles = rolesResult.data || [];

      // 加载统计数据
      const statsResponse = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const statsResult = await statsResponse.json();
      this.stats = statsResult.data || {};

    } catch (error) {
      console.error('Failed to load user profile:', error);
      alert('加载用户信息失败，请重试');
    }
  }

  render() {
    const html = `
      <div class="user-profile-page">
        <div class="profile-header">
          <div class="profile-avatar">
            ${this.user && this.user.avatar ?
              `<img src="${this.user.avatar}" alt="${this.user.nickname || this.user.name}">` :
              `<div class="avatar-placeholder">${(this.user && (this.user.nickname || this.user.name) || 'U').charAt(0)}</div>`
            }
          </div>
          <div class="profile-info">
            <h1 class="profile-name">${this.user ? (this.user.nickname || this.user.name) : '用户'}</h1>
            <p class="profile-email">${this.user ? this.user.email : ''}</p>
            ${this.user && this.user.description ?
              `<p class="profile-description">${this.user.description}</p>` : ''
            }
          </div>
          <button class="btn-edit-profile" id="edit-profile-btn">编辑</button>
        </div>

        <div class="profile-tabs">
          <button class="tab ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 8H12M8 4H12M8 12H12M4 4H4.01M4 8H4.01M4 12H4.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            个人信息
          </button>
          <button class="tab ${this.activeTab === 'organizations' ? 'active' : ''}" data-tab="organizations">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 7H13M3 11H13M3 4H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            组织架构
          </button>
          <button class="tab ${this.activeTab === 'roles' ? 'active' : ''}" data-tab="roles">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3H3V5M5 13H3V11M11 3H13V5M11 13H13V11M8 4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            角色信息
          </button>
          <button class="tab ${this.activeTab === 'stats' ? 'active' : ''}" data-tab="stats">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 13H14M2 10H14M2 7H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            统计数据
          </button>
        </div>

        <div class="tab-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderTabContent() {
    switch (this.activeTab) {
      case 'profile':
        return this.renderProfileTab();
      case 'organizations':
        return this.renderOrganizationsTab();
      case 'roles':
        return this.renderRolesTab();
      case 'stats':
        return this.renderStatsTab();
      default:
        return '';
    }
  }

  renderProfileTab() {
    return `
      <div class="profile-tab">
        <h3>基本信息</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">用户名:</span>
            <span class="info-value">${this.user ? (this.user.nickname || this.user.name) : '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱:</span>
            <span class="info-value">${this.user ? this.user.email : '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">注册时间:</span>
            <span class="info-value">${this.user ? new Date(this.user.created_at).toLocaleDateString('zh-CN') : '-'}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderOrganizationsTab() {
    if (this.organizations.length === 0) {
      return '<div class="empty-state">暂无组织信息</div>';
    }

    return `
      <div class="organizations-tab">
        <h3>组织架构</h3>
        <div class="org-list">
          ${this.organizations.map(org => this.renderOrganizationItem(org)).join('')}
        </div>
      </div>
    `;
  }

  renderOrganizationItem(org) {
    return `
      <div class="org-item">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="org-icon">
          <path d="M4 4H16M4 10H16M4 16H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div class="org-info">
          <div class="org-name">${org.name}</div>
          ${org.position ? `<div class="org-position">${org.position}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderRolesTab() {
    if (this.roles.length === 0) {
      return '<div class="empty-state">暂无角色信息</div>';
    }

    return `
      <div class="roles-tab">
        <h3>角色信息</h3>
        <div class="role-list">
          ${this.roles.map(role => this.renderRoleItem(role)).join('')}
        </div>
      </div>
    `;
  }

  renderRoleItem(role) {
    return `
      <div class="role-item">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="role-icon">
          <path d="M5 3H3V5M5 13H3V11M11 3H13V5M11 13H13V11M8 4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div class="role-info">
          <div class="role-name">${role.name}</div>
          ${role.description ? `<div class="role-description">${role.description}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderStatsTab() {
    return `
      <div class="stats-tab">
        <h3>统计数据</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="stat-icon">
              <path d="M5 16H27M5 10H27M5 22H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="stat-value">${this.stats.totalTasks || 0}</div>
            <div class="stat-label">总任务数</div>
          </div>
          <div class="stat-card">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="stat-icon">
              <path d="M5 16L12 23L27 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="stat-value">${this.stats.completedTasks || 0}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="stat-icon">
              <path d="M5 6H27M5 12H27M5 18H18M5 24H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="stat-value">${this.stats.createdTasks || 0}</div>
            <div class="stat-label">创建的任务</div>
          </div>
          <div class="stat-card">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="stat-icon">
              <path d="M16 6L22 12L10 24L4 24V18L16 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="stat-value">${this.stats.favoriteTasks || 0}</div>
            <div class="stat-label">收藏的任务</div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 标签页切换
    const tabs = this.container.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.dataset.tab;
        this.render();
        this.bindEvents();
      });
    });

    // 编辑个人资料
    const editBtn = this.container.querySelector('#edit-profile-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.showEditDialog();
      });
    }
  }

  showEditDialog() {
    const nickname = this.user.nickname || '';
    const description = this.user.description || '';

    const html = `
      <div class="modal-overlay" id="edit-profile-modal">
        <div class="modal">
          <div class="modal-header">
            <h2>编辑个人资料</h2>
            <button class="btn-close" id="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>昵称</label>
              <input type="text" id="edit-nickname" value="${nickname}" maxlength="50">
            </div>
            <div class="form-group">
              <label>个人描述</label>
              <textarea id="edit-description" rows="4" maxlength="500">${description}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" id="cancel-edit">取消</button>
            <button class="btn-save" id="save-profile">保存</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const modal = document.getElementById('edit-profile-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-edit');
    const saveBtn = document.getElementById('save-profile');

    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', async () => {
      const nickname = document.getElementById('edit-nickname').value.trim();
      const description = document.getElementById('edit-description').value.trim();

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nickname, description })
        });

        if (!response.ok) {
          throw new Error('保存失败');
        }

        alert('保存成功');
        closeModal();
        await this.loadAllData();
        this.render();
        this.bindEvents();

      } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败，请重试');
      }
    });
  }
}

// 导出为全局变量
window.UserProfilePage = UserProfilePage;
