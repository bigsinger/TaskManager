/**
 * Task Entity
 */
import { TaskStatus } from '../value-objects/TaskStatus';
import { TaskPriority } from '../value-objects/TaskPriority';
import { User } from './User';

export class Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedBy: User | null;
  assignedTo: User | null;
  createdBy: User | null;
  updatedBy: User | null;

  constructor(data: any) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    this.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    this.tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : (data.tags || []);
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
    this.completedBy = data.completedBy ? new User(data.completedBy) : null;
    this.assignedTo = data.assignedTo ? new User(data.assignedTo) : null;
    this.createdBy = data.createdBy ? new User(data.createdBy) : null;
    this.updatedBy = data.updatedBy ? new User(data.updatedBy) : null;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedBy: this.completedBy ? this.completedBy.id : null,
      assignedTo: this.assignedTo ? this.assignedTo.id : null,
      createdBy: this.createdBy ? this.createdBy.id : null,
      updatedBy: this.updatedBy ? this.updatedBy.id : null
    };
  }

  static fromJSON(json: any): Task {
    return new Task(json);
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (this.description && this.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    if (this.tags && this.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default Task;
