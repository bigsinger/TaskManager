/**
 * 情境切换器组件
 *
 * 用于显示和切换当前情境（项目）
 */

class ContextSwitcher {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      currentContextId: options.currentContextId || null,
      onContextChange: options.onContextChange || (() => {}),
      ...options
    };

    this.contexts = [];
    this.currentContext = null;

    this.init();
  }

  async init() {
    if (!this.container) {
      console.error('ContextSwitcher: Container not found');
      return;
    }

    await this.loadContexts();
    this.render();
  }

  async loadContexts() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contexts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load contexts');
      }

      const result = await response.json();
      this.contexts = result.data || [];

      // 设置当前情境
      if (this.options.currentContextId) {
        this.currentContext = this.contexts.find(c => c.id === this.options.currentContextId);
      } else if (this.contexts.length > 0) {
        this.currentContext = this.contexts[0];
      }
    } catch (error) {
      console.error('Failed to load contexts:', error);
      this.contexts = [];
    }
  }

  render() {
    if (this.contexts.length === 0) {
      this.container.innerHTML = '<div class="context-switcher-empty">暂无情境</div>';
      return;
    }

    const html = `
      <div class="context-switcher">
        <div class="context-switcher-label">情境：</div>
        <div class="context-switcher-wrapper">
          <div class="context-switcher-current" id="context-current">
            ${this.renderCurrentContext()}
          </div>
          <div class="context-switcher-dropdown" id="context-dropdown" style="display: none;">
            ${this.contexts.map(context => this.renderContextItem(context)).join('')}
            <div class="context-switcher-item" id="context-all">
              全部任务
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindEvents();
  }

  renderCurrentContext() {
    if (!this.currentContext) {
      return '<span class="context-switcher-name">全部任务</span>';
    }

    return `
      <div class="context-switcher-avatar">
        ${this.currentContext.avatar ? 
          `<img src="${this.currentContext.avatar}" alt="${this.currentContext.name}">` :
          '<div class="context-avatar-placeholder">' + this.currentContext.name.charAt(0) + '</div>'
        }
      </div>
      <span class="context-switcher-name">${this.currentContext.name}</span>
      <span class="context-switcher-count">${this.currentContext.task_count || 0}</span>
      <svg class="context-switcher-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  renderContextItem(context) {
    const isActive = this.currentContext && this.currentContext.id === context.id;
    return `
      <div class="context-switcher-item ${isActive ? 'active' : ''}" data-id="${context.id}">
        <div class="context-item-avatar">
          ${context.avatar ? 
            `<img src="${context.avatar}" alt="${context.name}">` :
            '<div class="context-avatar-placeholder">' + context.name.charAt(0) + '</div>'
          }
        </div>
        <span class="context-item-name">${context.name}</span>
        <span class="context-item-count">${context.task_count || 0}</span>
      </div>
    `;
  }

  bindEvents() {
    const currentEl = this.container.querySelector('#context-current');
    const dropdownEl = this.container.querySelector('#context-dropdown');
    const items = this.container.querySelectorAll('.context-switcher-item');

    // 切换下拉菜单
    currentEl.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownEl.style.display = dropdownEl.style.display === 'none' ? 'block' : 'none';
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        dropdownEl.style.display = 'none';
      }
    });

    // 点击情境项
    items.forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const contextId = item.dataset.id;

        if (contextId === undefined) {
          // 全部任务
          this.currentContext = null;
        } else {
          this.currentContext = this.contexts.find(c => c.id === contextId);
        }

        dropdownEl.style.display = 'none';
        this.render();
        this.options.onContextChange(this.currentContext);
      });
    });
  }

  async refresh() {
    await this.loadContexts();
    this.render();
  }

  setCurrentContext(contextId) {
    if (contextId) {
      this.currentContext = this.contexts.find(c => c.id === contextId);
    } else {
      this.currentContext = null;
    }
    this.render();
  }
}

// 导出为全局变量
window.ContextSwitcher = ContextSwitcher;
