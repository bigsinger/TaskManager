/**
 * Command Manager - 撤销/重做管理器
 * 使用Command模式实现操作历史记录
 */

class CommandManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50; // 最大历史记录数
    }

    /**
     * 执行命令
     * @param {Command} command - 命令对象
     */
    async execute(command) {
        // 执行命令
        await command.execute();
        
        // 如果当前不在历史末尾，删除当前位置之后的历史
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        // 添加新命令到历史
        this.history.push(command);
        this.currentIndex++;
        
        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
        
        // 更新UI状态
        this.updateUIState();
        
        // 显示提示
        showToast(command.getDescription(), 'info');
    }

    /**
     * 撤销操作
     */
    async undo() {
        if (this.canUndo()) {
            const command = this.history[this.currentIndex];
            await command.undo();
            this.currentIndex--;
            this.updateUIState();
            showToast(`撤销: ${command.getDescription()}`, 'info');
        }
    }

    /**
     * 重做操作
     */
    async redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            const command = this.history[this.currentIndex];
            await command.execute();
            this.updateUIState();
            showToast(`重做: ${command.getDescription()}`, 'info');
        }
    }

    /**
     * 是否可以撤销
     */
    canUndo() {
        return this.currentIndex >= 0;
    }

    /**
     * 是否可以重做
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * 更新UI状态
     */
    updateUIState() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
            undoBtn.style.opacity = this.canUndo() ? '1' : '0.5';
        }
        
        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
            redoBtn.style.opacity = this.canRedo() ? '1' : '0.5';
        }
    }

    /**
     * 清空历史
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.updateUIState();
    }

    /**
     * 获取历史记录
     */
    getHistory() {
        return this.history.map((cmd, index) => ({
            description: cmd.getDescription(),
            timestamp: cmd.timestamp,
            isCurrent: index === this.currentIndex
        }));
    }
}

/**
 * 基础命令类
 */
class Command {
    constructor(description) {
        this.description = description;
        this.timestamp = new Date();
    }

    async execute() {
        throw new Error('Execute method must be implemented');
    }

    async undo() {
        throw new Error('Undo method must be implemented');
    }

    getDescription() {
        return this.description;
    }
}

/**
 * 创建任务命令
 */
class CreateTaskCommand extends Command {
    constructor(taskData, apiUrl) {
        super(`创建任务: ${taskData.title}`);
        this.taskData = taskData;
        this.apiUrl = apiUrl;
        this.createdTask = null;
    }

    async execute() {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.taskData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        
        this.createdTask = await response.json();
        return this.createdTask;
    }

    async undo() {
        if (this.createdTask) {
            await fetch(`${this.apiUrl}/${this.createdTask.id}`, {
                method: 'DELETE'
            });
        }
    }
}

/**
 * 更新任务命令
 */
class UpdateTaskCommand extends Command {
    constructor(taskId, oldData, newData, apiUrl) {
        super(`更新任务: ${newData.title || oldData.title}`);
        this.taskId = taskId;
        this.oldData = oldData;
        this.newData = newData;
        this.apiUrl = apiUrl;
    }

    async execute() {
        const response = await fetch(`${this.apiUrl}/${this.taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.newData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        return await response.json();
    }

    async undo() {
        await fetch(`${this.apiUrl}/${this.taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.oldData)
        });
    }
}

/**
 * 删除任务命令
 */
class DeleteTaskCommand extends Command {
    constructor(task, apiUrl) {
        super(`删除任务: ${task.title}`);
        this.task = task;
        this.apiUrl = apiUrl;
        this.deleted = false;
    }

    async execute() {
        const response = await fetch(`${this.apiUrl}/${this.task.id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        this.deleted = true;
    }

    async undo() {
        // 重新创建任务
        const { id, ...taskData } = this.task;
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            const newTask = await response.json();
            this.task.id = newTask.id; // 更新ID
        }
    }
}

/**
 * 批量操作命令
 */
class BatchCommand extends Command {
    constructor(description, commands) {
        super(description);
        this.commands = commands;
    }

    async execute() {
        for (const command of this.commands) {
            await command.execute();
        }
    }

    async undo() {
        // 反向撤销
        for (let i = this.commands.length - 1; i >= 0; i--) {
            await this.commands[i].undo();
        }
    }
}

// 创建全局命令管理器
const commandManager = new CommandManager();

// 导出到全局
window.commandManager = commandManager;
window.CreateTaskCommand = CreateTaskCommand;
window.UpdateTaskCommand = UpdateTaskCommand;
window.DeleteTaskCommand = DeleteTaskCommand;
window.BatchCommand = BatchCommand;

// 键盘快捷键
if (typeof window !== 'undefined') {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z 撤销
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            commandManager.undo();
        }
        
        // Ctrl+Y 或 Ctrl+Shift+Z 重做
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            commandManager.redo();
        }
    });
}
