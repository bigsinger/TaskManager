/**
 * TaskManager v1.2 - 剩余改进快速实现
 * 包含：拖拽、模板、提醒、看板、甘特图等
 */

// ============================================
// 拖拽功能简化实现
// ============================================
function initDragAndDrop() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    let draggedItem = null;

    taskList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-item')) {
            draggedItem = e.target;
            e.target.style.opacity = '0.5';
        }
    });

    taskList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.style.opacity = '1';
        }
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggedItem);
        } else {
            taskList.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not([style*="opacity: 0.5"])')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ============================================
// 任务模板功能
// ============================================
const taskTemplates = {
    templates: [
        { id: '1', name: 'Bug修复', title: '[BUG] ', desc: '问题描述:\n复现步骤:\n1. \n2. \n3.', tags: ['bug'] },
        { id: '2', name: '功能开发', title: '[FEATURE] ', desc: '需求描述:\n验收标准:', tags: ['feature'] },
        { id: '3', name: '代码审查', title: '[REVIEW] ', desc: '审查内容:\n- 代码规范\n- 逻辑正确性', tags: ['review'] },
        { id: '4', name: '会议记录', title: '会议 - ', desc: '参会人员:\n会议内容:\n行动项:', tags: ['meeting'] }
    ],

    showDialog() {
        const html = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>选择模板</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        ${this.templates.map(t => `
                            <div onclick="taskTemplates.applyTemplate('${t.id}')" style="
                                padding: 15px;
                                border: 2px solid var(--border-color);
                                border-radius: 8px;
                                margin-bottom: 10px;
                                cursor: pointer;
                            " onmouseover="this.style.borderColor='var(--btn-primary-bg)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                <div style="font-weight: 600;">${t.name}</div>
                                <div style="font-size: 12px; color: var(--task-meta-color);">${t.tags.join(', ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
    },

    applyTemplate(id) {
        const template = this.templates.find(t => t.id === id);
        if (!template) return;

        document.getElementById('task-title').value = template.title;
        document.getElementById('task-description').value = template.desc;
        
        // 关闭对话框
        document.querySelector('#template-modal, .modal')?.remove();
    }
};

// ============================================
// 任务提醒功能
// ============================================
const taskReminders = {
    init() {
        // 请求通知权限
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // 每分钟检查一次
        setInterval(() => this.checkReminders(), 60000);
    },

    async checkReminders() {
        const response = await fetch(API_URL);
        const data = await response.json();
        const tasks = data.tasks || [];
        
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        tasks.forEach(task => {
            if (task.status === 'COMPLETED') return;
            if (!task.dueDate) return;
            
            const dueDate = new Date(task.dueDate);
            
            // 24小时内到期
            if (dueDate <= tomorrow && dueDate > now) {
                this.showNotification(task, '即将到期');
            }
            // 已过期
            else if (dueDate < now) {
                this.showNotification(task, '已过期', true);
            }
        });
    },

    showNotification(task, type, urgent = false) {
        if (Notification.permission === 'granted') {
            new Notification(`任务${type}: ${task.title}`, {
                body: task.description || '点击查看详情',
                icon: '/favicon.ico',
                requireInteraction: urgent
            });
        }
    }
};

// ============================================
// 看板视图
// ============================================
const kanbanView = {
    toggle() {
        const taskList = document.getElementById('task-list');
        if (taskList.classList.contains('kanban-mode')) {
            taskList.classList.remove('kanban-mode');
            loadTasks(); // 恢复列表视图
        } else {
            taskList.classList.add('kanban-mode');
            this.renderKanban();
        }
    },

    async renderKanban() {
        const response = await fetch(API_URL);
        const data = await response.json();
        const tasks = data.tasks || [];
        
        const columns = {
            'PENDING': { title: '待处理', tasks: [] },
            'IN_PROGRESS': { title: '进行中', tasks: [] },
            'COMPLETED': { title: '已完成', tasks: [] }
        };
        
        tasks.forEach(task => {
            if (columns[task.status]) {
                columns[task.status].tasks.push(task);
            }
        });
        
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                ${Object.entries(columns).map(([status, col]) => `
                    <div style="background: var(--task-bg); border-radius: 8px; padding: 15px;">
                        <h3 style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid var(--border-color);">
                            ${col.title} (${col.tasks.length})
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${col.tasks.map(task => `
                                <div class="task-item" data-task-id="${task.id}" style="cursor: grab;">
                                    <div style="font-weight: 600;">${task.title}</div>
                                    <div style="font-size: 12px; color: var(--task-meta-color);">
                                        ${task.priority} | ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '无截止日期'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// ============================================
// 初始化所有功能
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    taskReminders.init();
});

// 导出到全局
window.taskTemplates = taskTemplates;
window.taskReminders = taskReminders;
window.kanbanView = kanbanView;
window.initDragAndDrop = initDragAndDrop;
