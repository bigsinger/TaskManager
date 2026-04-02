/**
 * 角色选择器组件
 *
 * 用于选择任务的执行者、报告人、验证人
 */

class RoleSelector {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      language: 'zh',
      users: options.users || [],
      assigneeId: options.assigneeId || null,
      reporterId: options.reporterId || null,
      verifierId: options.verifierId || null,
      onChange: options.onChange || (() => {}),
      ...options
    };

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const labels = {
      assignee: this.options.language === 'zh' ? '执行者' : 'Assignee',
      reporter: this.options.language === 'zh' ? '报告人' : 'Reporter',
      verifier: this.options.language === 'zh' ? '验证人' : 'Verifier',
      selectUser: this.options.language === 'zh' ? '选择用户' : 'Select user',
      notAssigned: this.options.language === 'zh' ? '未分配' : 'Not assigned'
    };

    this.container.innerHTML = `
      <div class="role-selector">
        <div class="role-group">
          <label class="role-label">
            ${labels.assignee}
          </label>
          <select class="role-select role-assignee" data-role="assignee">
            <option value="">${labels.notAssigned}</option>
            ${this.options.users.map(user => `
              <option value="${user.id}" ${this.options.assigneeId === user.id ? 'selected' : ''}>
                ${user.name || user.email}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="role-group">
          <label class="role-label">
            ${labels.reporter}
          </label>
          <select class="role-select role-reporter" data-role="reporter">
            <option value="">${labels.notAssigned}</option>
            ${this.options.users.map(user => `
              <option value="${user.id}" ${this.options.reporterId === user.id ? 'selected' : ''}>
                ${user.name || user.email}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="role-group">
          <label class="role-label">
            ${labels.verifier}
          </label>
          <select class="role-select role-verifier" data-role="verifier">
            <option value="">${labels.notAssigned}</option>
            ${this.options.users.map(user => `
              <option value="${user.id}" ${this.options.verifierId === user.id ? 'selected' : ''}>
                ${user.name || user.email}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const selects = this.container.querySelectorAll('.role-select');

    selects.forEach(select => {
      select.addEventListener('change', () => {
        this.handleChange();
      });
    });
  }

  handleChange() {
    const assigneeSelect = this.container.querySelector('.role-assignee');
    const reporterSelect = this.container.querySelector('.role-reporter');
    const verifierSelect = this.container.querySelector('.role-verifier');

    const values = {
      assignee_id: assigneeSelect.value || null,
      reporter_id: reporterSelect.value || null,
      verifier_id: verifierSelect.value || null
    };

    this.options.onChange(values);
  }

  setUsers(users) {
    this.options.users = users || [];
    this.render();
    this.bindEvents();
  }

  setValue(roleId, userId) {
    const select = this.container.querySelector(`.role-${roleId}`);
    if (select) {
      select.value = userId || '';
      this.handleChange();
    }
  }

  getValue() {
    const assigneeSelect = this.container.querySelector('.role-assignee');
    const reporterSelect = this.container.querySelector('.role-reporter');
    const verifierSelect = this.container.querySelector('.role-verifier');

    return {
      assignee_id: assigneeSelect.value || null,
      reporter_id: reporterSelect.value || null,
      verifier_id: verifierSelect.value || null
    };
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export default RoleSelector;
