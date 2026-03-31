/**
 * Export Controller - 后端导出API
 * 支持 CSV、Excel、PDF 格式导出
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExportController {
    /**
     * 导出任务为 CSV
     */
    async exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tasks = await this.getTasksForExport(req);
            const csv = this.generateCSV(tasks);
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="tasks_${new Date().toISOString().slice(0, 10)}.csv"`);
            res.send(csv);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 导出任务为 Excel
     */
    async exportExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tasks = await this.getTasksForExport(req);
            const excel = this.generateExcel(tasks);
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="tasks_${new Date().toISOString().slice(0, 10)}.xlsx"`);
            res.send(excel);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 导出任务为 JSON
     */
    async exportJSON(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tasks = await this.getTasksForExport(req);
            
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="tasks_${new Date().toISOString().slice(0, 10)}.json"`);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 获取任务列表
     */
    private async getTasksForExport(req: Request): Promise<any[]> {
        const userId = req.user?.userId;
        
        const tasks = await prisma.task.findMany({
            where: userId ? { createdById: userId } : {},
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                updatedBy: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
                completedBy: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return tasks;
    }

    /**
     * 生成 CSV
     */
    private generateCSV(tasks: any[]): string {
        const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Tags', 'Due Date', 'Created At', 'Updated At', 'Created By'];
        
        const rows = tasks.map(task => [
            task.id,
            this.escapeCSV(task.title),
            this.escapeCSV(task.description || ''),
            task.status,
            task.priority,
            this.formatTags(task.tags),
            task.dueDate ? new Date(task.dueDate).toISOString() : '',
            new Date(task.createdAt).toISOString(),
            new Date(task.updatedAt).toISOString(),
            task.createdBy?.name || ''
        ]);

        const BOM = '\uFEFF'; // UTF-8 BOM for Excel
        return BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    /**
     * 生成 Excel (使用 CSV 格式)
     */
    private generateExcel(tasks: any[]): string {
        // 实际项目中可以使用 xlsx 库生成真正的 Excel 文件
        // 这里使用制表符分隔的 CSV 作为简化方案
        const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Tags', 'Due Date', 'Created At'];
        
        const rows = tasks.map(task => [
            task.id,
            task.title,
            task.description || '',
            task.status,
            task.priority,
            this.formatTags(task.tags),
            task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
            new Date(task.createdAt).toLocaleString()
        ]);

        const BOM = '\uFEFF';
        return BOM + [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
    }

    /**
     * 转义 CSV
     */
    private escapeCSV(value: string): string {
        if (!value) return '';
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    /**
     * 格式化标签
     */
    private formatTags(tags: any): string {
        if (!tags) return '';
        try {
            const parsed = typeof tags === 'string' ? JSON.parse(tags) : tags;
            return Array.isArray(parsed) ? parsed.join(', ') : '';
        } catch {
            return '';
        }
    }
}

export default ExportController;
