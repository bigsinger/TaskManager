/**
 * Export Module - 任务导出功能
 * 支持 CSV、Excel、PDF 格式导出
 */

class TaskExporter {
    constructor() {
        this.exportFormats = {
            csv: this.exportToCSV.bind(this),
            excel: this.exportToExcel.bind(this),
            pdf: this.exportToPDF.bind(this),
            json: this.exportToJSON.bind(this)
        };
    }

    /**
     * 导出任务
     * @param {Array} tasks - 任务数组
     * @param {string} format - 导出格式 (csv, excel, pdf, json)
     * @param {string} filename - 文件名（不含扩展名）
     */
    async export(tasks, format = 'csv', filename = 'tasks') {
        if (!this.exportFormats[format]) {
            throw new Error(`Unsupported format: ${format}`);
        }

        return this.exportFormats[format](tasks, filename);
    }

    /**
     * 导出为 CSV
     * @param {Array} tasks - 任务数组
     * @param {string} filename - 文件名
     */
    exportToCSV(tasks, filename) {
        const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Tags', 'Due Date', 'Created At', 'Updated At'];
        
        const rows = tasks.map(task => [
            task.id,
            this.escapeCSV(task.title),
            this.escapeCSV(task.description || ''),
            task.status,
            task.priority,
            this.formatTags(task.tags),
            task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
            new Date(task.createdAt).toLocaleString(),
            new Date(task.updatedAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * 导出为 Excel (使用 CSV 格式，Excel 可以打开)
     * @param {Array} tasks - 任务数组
     * @param {string} filename - 文件名
     */
    exportToExcel(tasks, filename) {
        // 使用 CSV 格式，添加 BOM 以支持中文
        const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Tags', 'Due Date', 'Created At', 'Updated At'];
        
        const rows = tasks.map(task => [
            task.id,
            this.escapeCSV(task.title),
            this.escapeCSV(task.description || ''),
            task.status,
            task.priority,
            this.formatTags(task.tags),
            task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
            new Date(task.createdAt).toLocaleString(),
            new Date(task.updatedAt).toLocaleString()
        ]);

        // 添加 BOM 以支持 Excel 中文显示
        const BOM = '\uFEFF';
        const csvContent = BOM + [
            headers.join('\t'), // 使用制表符分隔
            ...rows.map(row => row.join('\t'))
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
    }

    /**
     * 导出为 PDF
     * @param {Array} tasks - 任务数组
     * @param {string} filename - 文件名
     */
    exportToPDF(tasks, filename) {
        // 创建 HTML 内容用于打印/PDF
        const htmlContent = this.generatePDFHTML(tasks);
        
        // 打开新窗口打印
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // 延迟打印以确保样式加载
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    }

    /**
     * 导出为 JSON
     * @param {Array} tasks - 任务数组
     * @param {string} filename - 文件名
     */
    exportToJSON(tasks, filename) {
        const jsonContent = JSON.stringify(tasks, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
    }

    /**
     * 生成 PDF HTML
     * @param {Array} tasks - 任务数组
     * @returns {string} - HTML 字符串
     */
    generatePDFHTML(tasks) {
        const rows = tasks.map(task => `
            <tr>
                <td>${this.escapeHTML(task.title)}</td>
                <td>${this.escapeHTML(task.description || '-')}</td>
                <td>${task.status}</td>
                <td>${task.priority}</td>
                <td>${this.formatTags(task.tags)}</td>
                <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Task Export</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #667eea; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .meta { color: #666; font-size: 12px; margin-top: 20px; }
                    @media print {
                        .no-print { display: none; }
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <h1>Task Export Report</h1>
                <p class="meta">Generated on: ${new Date().toLocaleString()}</p>
                <p class="meta">Total Tasks: ${tasks.length}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Tags</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
                
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">Print / Save as PDF</button>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * 转义 CSV 特殊字符
     * @param {string} value - 输入值
     * @returns {string} - 转义后的值
     */
    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // 如果包含逗号、引号或换行符，用引号包裹
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    /**
     * 转义 HTML 特殊字符
     * @param {string} text - 输入文本
     * @returns {string} - 转义后的文本
     */
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 格式化标签
     * @param {Array|string} tags - 标签数组或JSON字符串
     * @returns {string} - 格式化后的标签
     */
    formatTags(tags) {
        if (!tags) return '';
        try {
            const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
            return Array.isArray(tagsArray) ? tagsArray.join(', ') : '';
        } catch (e) {
            return '';
        }
    }

    /**
     * 下载文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} mimeType - MIME 类型
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// 导出单例
const taskExporter = new TaskExporter();

// 导出函数供全局使用
window.exportTasks = async function(format = 'csv') {
    try {
        // 获取所有任务（不分页）
        const response = await fetch(`${API_URL}?limit=10000`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        const tasks = data.tasks || [];
        
        if (tasks.length === 0) {
            showToast('No tasks to export', 'warning');
            return;
        }
        
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `tasks_${timestamp}`;
        
        await taskExporter.export(tasks, format, filename);
        
        showToast(`Tasks exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showToast('Export failed. Please try again.', 'error');
    }
};

// 显示导出对话框
window.showExportDialog = function() {
    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.id = 'export-modal';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Export Tasks</h2>
                <span class="close" onclick="closeExportDialog()">&times;</span>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 20px; color: var(--task-meta-color);">
                    Choose the format to export your tasks:
                </p>
                <div class="export-options" style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-secondary" onclick="exportTasks('csv'); closeExportDialog();" style="justify-content: flex-start;">
                        📊 Export as CSV
                    </button>
                    <button class="btn btn-secondary" onclick="exportTasks('excel'); closeExportDialog();" style="justify-content: flex-start;">
                        📈 Export as Excel
                    </button>
                    <button class="btn btn-secondary" onclick="exportTasks('pdf'); closeExportDialog();" style="justify-content: flex-start;">
                        📄 Export as PDF
                    </button>
                    <button class="btn btn-secondary" onclick="exportTasks('json'); closeExportDialog();" style="justify-content: flex-start;">
                        💾 Export as JSON
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    dialog.style.display = 'flex';
    
    // 点击外部关闭
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeExportDialog();
        }
    });
};

// 关闭导出对话框
window.closeExportDialog = function() {
    const dialog = document.getElementById('export-modal');
    if (dialog) {
        dialog.remove();
    }
};
