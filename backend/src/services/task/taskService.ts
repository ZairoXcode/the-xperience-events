import mongoose from 'mongoose';
import { Task } from '../../models';
import { ITask, TaskStatus, TaskPriority, EntitySource } from '../../types';
import { ActivityService } from '../activity/activityService';
import { normalizeTaskStatus, normalizeTaskPriority } from '../../utils/normalizers';

export class TaskService {
  static async create(
    eventId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | string;
      category?: string;
      relatedVendorId?: string | mongoose.Types.ObjectId;
      relatedActivity?: string;
      source?: EntitySource;
    }
  ): Promise<ITask> {
    const status = normalizeTaskStatus(data.status);
    const priority = normalizeTaskPriority(data.priority);
    const task = await Task.create({
      eventId,
      userId,
      title: data.title,
      description: data.description,
      status,
      priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      category: data.category,
      relatedVendorId: data.relatedVendorId,
      relatedActivity: data.relatedActivity,
      source: data.source || 'MANUAL',
    });

    await ActivityService.log({
      eventId,
      userId,
      description: `Task created: "${task.title}" [${task.priority}]`,
      type: 'TASK',
      entityType: 'task',
      entityId: task._id,
      metadata: { source: task.source, status: task.status },
    });

    return task;
  }

  static async listByEvent(
    eventId: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; category?: string }
  ): Promise<ITask[]> {
    const query: Record<string, unknown> = { eventId };
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.category) query.category = filters.category;

    return Task.find(query).sort({ createdAt: -1 }).lean();
  }

  static async getById(taskId: string, userId: string): Promise<ITask | null> {
    return Task.findOne({ _id: taskId, userId }).lean();
  }

  static async update(
    taskId: string,
    userId: string,
    updates: Partial<ITask>
  ): Promise<ITask | null> {
    const current = await Task.findOne({ _id: taskId, userId });
    if (!current) return null;

    const oldStatus = current.status;

    if (updates.title) current.title = updates.title;
    if (updates.description !== undefined) current.description = updates.description;
    if (updates.status) current.status = normalizeTaskStatus(updates.status);
    if (updates.priority) current.priority = normalizeTaskPriority(updates.priority);
    if (updates.dueDate) current.dueDate = new Date(updates.dueDate);
    if (updates.category) current.category = updates.category;
    if (updates.relatedActivity) current.relatedActivity = updates.relatedActivity;

    await current.save();

    if (updates.status && updates.status !== oldStatus) {
      await ActivityService.log({
        eventId: current.eventId,
        userId,
        description: `Task "${current.title}" status changed: ${oldStatus} → ${current.status}`,
        type: 'TASK',
        entityType: 'task',
        entityId: current._id,
      });
    }

    return current;
  }

  static async delete(taskId: string, userId: string): Promise<boolean> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return false;

    await Task.deleteOne({ _id: taskId });

    await ActivityService.log({
      eventId: task.eventId,
      userId,
      description: `Task deleted: "${task.title}"`,
      type: 'DELETE',
      entityType: 'task',
    });

    return true;
  }

  static async findOrCreateOrUpdateByTitle(
    eventId: string,
    userId: string,
    title: string,
    data: Partial<ITask>
  ): Promise<{ task: ITask; created: boolean }> {
    // Look for matching task by fuzzy/case-insensitive regex
    const regex = new RegExp(`^${title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const existing = await Task.findOne({ eventId, title: regex });

    if (existing) {
      if (data.status) existing.status = normalizeTaskStatus(data.status);
      if (data.priority) existing.priority = normalizeTaskPriority(data.priority);
      if (data.description) existing.description = data.description;
      if (data.category) existing.category = data.category;
      if (data.dueDate) existing.dueDate = new Date(data.dueDate);
      if (data.relatedActivity) existing.relatedActivity = data.relatedActivity;
      await existing.save();
      return { task: existing, created: false };
    }

    const newTask = await this.create(eventId, userId, {
      title,
      ...data,
      source: 'AI',
    });
    return { task: newTask, created: true };
  }
}
