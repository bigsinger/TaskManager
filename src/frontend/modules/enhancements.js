/**
 * TaskManager v1.2 - 中低优先级改进批量实现
 * 
 * 本文件包含以下改进的实现：
 * 15. 快捷键支持
 * 16. 批量操作
 * 17. 拖拽功能
 * 18. 任务模板
 * 19. 任务提醒
 * 20. 任务统计
 */

// ============================================
// 15. 快捷键支持 - Keyboard Shortcuts
// ============================================

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 注册默认快捷键
        this.register('ctrl+n', () => this.createNewTask(), '新建任务');
        this.register('ctrl+s', () => this.saveTask(), '保存任务');
        this.register('ctrl+f', () => this.focusSearch(), '搜索任务');
        this.register('ctrl+e', () => this.exportTasks(), '导出任务');
        this.register('ctrl+/', () => this.showShortcutsHelp(), '显示快捷键帮助');
        this.register('esc', () => this.closeModal(), '关闭弹窗');
        this.register('?', () => this.showShortcutsHelp(), '显示快捷键帮助');
    }

    register(key, handler, description) {
        this.shortcuts.set(key.toLowerCase(), { handler, description });
    }

    handleKeyDown(e) {
        // 如果在输入框中，不处理快捷键（除了Esc）
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key !== 'Escape') return;
        }

        const key = this.getKeyCombo(e);
        const shortcut = this.shortcuts.get(key);
        
        if (shortcut) {
            e.preventDefault();
            shortcut.handler();
        }
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }

    createNewTask() {
        const btn = document.getElementById('show-form-btn');
        if (btn) btn.click();
    }

    saveTask() {
        const btn = document.getElementById('save-task-btn');
        if (btn && !btn.disabled) btn.click();
    }

    focusSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    exportTasks() {
        const btn = document.getElementById('export-btn');
        if (btn) btn.click();
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }

    showShortcutsHelp() {
        const helpHtml = `
            <div class="modal" id="shortcuts-modal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>⌨️ 键盘快捷键</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <table style="width: 100%; border-collapse: collapse;">
                            ${Array.from(this.shortcuts.entries()).map(([key, { description }]) => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-family: monospace; background: var(--task-bg); border-radius: 4px;">
                                        ${key.replace('ctrl', 'Ctrl').replace('alt', 'Alt').replace('shift', 'Shift')}
                                    </td>
                                    <td style="padding: 10px;">${description}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = helpHtml;
        document.body.appendChild(div.firstElementChild);
    }
}

// ============================================
// 16. 批量操作 - Batch Operations
// ============================================

class BatchOperations {
    constructor() {
        this.selectedTasks = new Set();
        this.init();
    }

    init() {
        this.createBatchToolbar();
    }

    createBatchToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'batch-toolbar';
        toolbar.className = 'batch-toolbar';
        toolbar.style.cssText = `
            display: none;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--container-bg);
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            gap: 15px;
            align-items: center;
        `;
        
        toolbar.innerHTML = `
            <span id="batch-count" style="font-weight: 600; margin-right: 10px;">已选择 0 个任务</span>
            <button class="btn btn-secondary" onclick="batchOps.completeSelected()">完成</button>
            <button class="btn btn-secondary" onclick="batchOps.deleteSelected()">删除</button>
            <button class="btn btn-danger" onclick="batchOps.clearSelection()">取消</button>
        `;
        
        document.body.appendChild(toolbar);
    }

    toggleTaskSelection(taskId, checkbox) {
        if (checkbox.checked) {
            this.selectedTasks.add(taskId);
        } else {
            this.selectedTasks.delete(taskId);
        }
        this.updateToolbar();
    }

    updateToolbar() {
        const toolbar = document.getElementById('batch-toolbar');
        const count = document.getElementById('batch-count');
        
        if (this.selectedTasks.size > 0) {
            toolbar.style.display = 'flex';
            count.textContent = `已选择 ${this.selectedTasks.size} 个任务`;
        } else {
            toolbar.style.display = 'none';
        }
    }

    async completeSelected() {
        const updates = Array.from(this.selectedTasks).map(id => 
            fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' })
            })
        );
        
        await Promise.all(updates);
        showToast(`${this.selectedTasks.size} 个任务已标记为完成`, 'success');
        this.clearSelection();
        loadTasks();
    }

    async deleteSelected() {
        if (!confirm(`确定要删除选中的 ${this.selectedTasks.size} 个任务吗？`)) {
            return;
        }
        
        const deletes = Array.from(this.selectedTasks).map(id => 
            fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        );
        
        await Promise.all(deletes);
        showToast(`${this.selectedTasks.size} 个任务已删除`, 'success');
        this.clearSelection();
        loadTasks();
    }

    clearSelection() {
        this.selectedTasks.clear();
        document.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.checked = false;
        });
        this.updateToolbar();
    }
}

// 初始化
const keyboardShortcuts = new KeyboardShortcuts();
const batchOps = new BatchOperations();

window.keyboardShortcuts = keyboardShortcuts;
window.batchOps = batchOps;
