/**
 * 任务时间线组件
 *
 * 显示任务的所有操作历史
 */

class TaskTimeline {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      taskId: options.taskId || null,
      limit: options.limit || 50,
      ...options
    };

    this.activities = [];

    this.init();
  }

  async init() {
    if (!this.container) {
      console.error('TaskTimeline: Container not found');
      return;
    }

    if (!this.options.taskId) {
      this.container.innerHTML = '<div class="timeline-empty">未选择任务</div>';
      return;
    }

    await this.loadActivities();
    this.render();
  }

  async loadActivities() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${this.options.taskId}/activities?limit=${this.options.limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load activities');
      }

      const result = await response.json();
      this.activities = result.data || [];
    } catch (error) {
      console.error('Failed to load activities:', error);
      this.activities = [];
    }
  }

  render() {
    if (this.activities.length === 0) {
      this.container.innerHTML = '<div class="timeline-empty">暂无活动记录</div>';
      return;
    }

    const html = `
      <div class="task-timeline">
        <div class="timeline-header">
          <h3>活动记录</h3>
          <span class="timeline-count">${this.activities.length}条</span>
        </div>
        <div class="timeline-list">
          ${this.activities.map(activity => this.renderActivity(activity)).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderActivity(activity) {
    const actionText = this.getActionText(activity.action);
    const actionIcon = this.getActionIcon(activity.action);
    const timeText = this.formatTime(activity.created_at);

    return `
      <div class="timeline-item" data-action="${activity.action}">
        <div class="timeline-icon">
          ${actionIcon}
        </div>
        <div class="timeline-content">
          <div class="timeline-header-row">
            <span class="timeline-action">${actionText}</span>
            <span class="timeline-time">${timeText}</span>
          </div>
          ${activity.actor_name ? `<div class="timeline-actor">${activity.actor_name}</div>` : ''}
          ${activity.details ? `<div class="timeline-details">${this.renderDetails(activity.details)}</div>` : ''}
        </div>
      </div>
    `;
  }

  getActionText(action) {
    const actionMap = {
      'create': '创建了任务',
      'start': '开始了任务',
      'comment': '添加了评论',
      'edit': '编辑了任务',
      'status_change': '更新了状态',
      'complete': '完成了任务',
      'assign': '分配了任务',
      'favorite': '收藏了任务',
      'unfavorite': '取消收藏了任务'
    };

    return actionMap[action] || action;
  }

  getActionIcon(action) {
    const iconMap = {
      'create': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      'start': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2"/></svg>',
      'comment': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C9.37689 17 8.79403 16.8922 8.25777 16.701L7.61657 16.4749L5.64997 17.6693C5.09552 18.0013 4.38885 17.5117 4.49326 16.8755L4.83374 14.6493C4.25122 13.5148 3.9 12.2937 3.9 11V10H3Z" stroke="currentColor" stroke-width="2"/></svg>',
      'edit': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14.5 3.5L16.5 5.5L6.5 15.5H4.5V13.5L14.5 3.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'status_change': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3C5.58172 3 2 6.58172 2 11H5C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11H20C20 6.58172 16.4183 3 12 3H10Z" stroke="currentColor" stroke-width="2"/></svg>',
      'complete': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17 5.5L7.5 15L3 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'assign': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 9V11M10 15H10.01M5 20H15C16.1046 20 17 19.1046 17 18V6C17 4.89543 16.1046 4 15 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20Z" stroke="currentColor" stroke-width="2"/></svg>',
      'favorite': '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.354L8.795 4.197C5.265 6.692 3 9.197 3 11.5C3 14.538 5.462 17 8.5 17C9.082 17 9.642 16.886 10.161 16.679C10.68 16.886 11.24 17 11.822 17C14.86 17 17.322 14.538 17.322 11.5C17.322 9.197 15.057 6.692 11.527 4.197L10.322 3.354H10ZM10 5.646C12.943 7.692 14.322 9.555 14.322 11.5C14.322 12.881 13.203 14 11.822 14C11.336 14 10.918 13.848 10.562 13.596L10 13.197L9.438 13.596C9.082 13.848 8.664 14 8.178 14C6.797 14 5.678 12.881 5.678 11.5C5.678 9.555 7.057 7.692 10 5.646Z"/></svg>',
      'unfavorite': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3.354L8.795 4.197C5.265 6.692 3 9.197 3 11.5C3 14.538 5.462 17 8.5 17C9.082 17 9.642 16.886 10.161 16.679C10.68 16.886 11.24 17 11.822 17C14.86 17 17.322 14.538 17.322 11.5C17.322 9.197 15.057 6.692 11.527 4.197L10.322 3.354H10Z" stroke="currentColor" stroke-width="2"/></svg>'
    };

    return iconMap[action] || '';
  }

  renderDetails(details) {
    if (typeof details === 'string') {
      return details;
    }

    if (typeof details === 'object') {
      const items = Object.entries(details).map(([key, value]) => {
        const label = this.getLabel(key);
        return `<div class="detail-item"><span class="detail-label">${label}:</span> <span class="detail-value">${value}</span></div>`;
      });

      return `<div class="timeline-details-grid">${items.join('')}</div>`;
    }

    return '';
  }

  getLabel(key) {
    const labelMap = {
      'status': '状态',
      'assignee': '执行者',
      'reporter': '报告人',
      'verifier': '验证人',
      'title': '标题',
      'description': '描述',
      'priority': '优先级',
      'estimated_time': '预计耗时'
    };

    return labelMap[key] || key;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return '刚刚';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  async refresh() {
    await this.loadActivities();
    this.render();
  }

  setTaskId(taskId) {
    this.options.taskId = taskId;
    this.init();
  }
}

// 导出为全局变量
window.TaskTimeline = TaskTimeline;
