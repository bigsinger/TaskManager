/**
 * Task Statistics - 任务统计功能
 */

class TaskStatistics {
    constructor() {
        this.charts = {};
    }

    async generateStats(tasks) {
        return {
            overview: this.getOverviewStats(tasks),
            byStatus: this.getStatusDistribution(tasks),
            byPriority: this.getPriorityDistribution(tasks),
            byTag: this.getTagDistribution(tasks),
            timeline: this.getTimelineStats(tasks),
            completion: this.getCompletionStats(tasks)
        };
    }

    getOverviewStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
        const pending = tasks.filter(t => t.status === 'PENDING').length;
        const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

        return { total, completed, pending, inProgress, completionRate };
    }

    getStatusDistribution(tasks) {
        const distribution = {};
        tasks.forEach(task => {
            distribution[task.status] = (distribution[task.status] || 0) + 1;
        });
        return distribution;
    }

    getPriorityDistribution(tasks) {
        const distribution = {};
        tasks.forEach(task => {
            distribution[task.priority] = (distribution[task.priority] || 0) + 1;
        });
        return distribution;
    }

    getTagDistribution(tasks) {
        const distribution = {};
        tasks.forEach(task => {
            const tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags || [];
            tags.forEach(tag => {
                distribution[tag] = (distribution[tag] || 0) + 1;
            });
        });
        return Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    getTimelineStats(tasks) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const created = tasks.filter(t => t.createdAt && t.createdAt.startsWith(dateStr)).length;
            const completed = tasks.filter(t => t.completedAt && t.completedAt.startsWith(dateStr)).length;
            
            last7Days.push({
                date: dateStr,
                created,
                completed
            });
        }
        return last7Days;
    }

    getCompletionStats(tasks) {
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
        const avgCompletionTime = completedTasks.length > 0
            ? completedTasks.reduce((sum, t) => {
                const created = new Date(t.createdAt);
                const completed = new Date(t.completedAt);
                return sum + (completed - created);
            }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // days
            : 0;

        return {
            completedCount: completedTasks.length,
            avgCompletionTime: avgCompletionTime.toFixed(1)
        };
    }

    renderStatsDialog(tasks) {
        const stats = this.generateStats(tasks);
        
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.style.display = 'flex';
        dialog.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>📊 任务统计</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- 概览卡片 -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${stats.overview.total}</div>
                            <div style="font-size: 14px; opacity: 0.9;">总任务</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #11998e, #38ef7d); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${stats.overview.completed}</div>
                            <div style="font-size: 14px; opacity: 0.9;">已完成</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #fc4a1a, #f7b733); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${stats.overview.completionRate}%</div>
                            <div style="font-size: 14px; opacity: 0.9;">完成率</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${stats.completion.avgCompletionTime}</div>
                            <div style="font-size: 14px; opacity: 0.9;">平均完成天数</div>
                        </div>
                    </div>

                    <!-- 状态分布 -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px;">状态分布</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${Object.entries(stats.byStatus).map(([status, count]) => `
                                <div style="background: var(--task-bg); padding: 10px 20px; border-radius: 20px;">
                                    <span style="font-weight: 600;">${status}:</span> ${count}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 热门标签 -->
                    <div>
                        <h3 style="margin-bottom: 15px;">热门标签 TOP10</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${stats.byTag.map(([tag, count]) => `
                                <div style="background: var(--btn-primary-bg); color: white; padding: 8px 16px; border-radius: 16px; font-size: 14px;">
                                    ${tag} (${count})
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
}

const taskStats = new TaskStatistics();
window.taskStats = taskStats;
window.showTaskStats = () => {
    fetch(API_URL)
        .then(r => r.json())
        .then(data => taskStats.renderStatsDialog(data.tasks || []));
};
