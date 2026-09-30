import mongoose from 'mongoose';
import { Deadline } from '../../models';
import { IDeadline, DeadlineStatus, EntitySource } from '../../types';
import { ActivityService } from '../activity/activityService';
import { normalizeDeadlineStatus } from '../../utils/normalizers';

export class DeadlineService {
  /**
   * Deterministic calculation of relative deadlines based on event date
   * e.g. "one week before", "7 days before", "two weeks before", "3 days before"
   */
  static calculateRelativeDate(referenceDate: Date, phrase: string): Date | null {
    const text = phrase.toLowerCase().trim();
    const ref = new Date(referenceDate);

    // Days before/after pattern
    const daysBeforeMatch = text.match(/(\d+)\s*days?\s*before/i);
    if (daysBeforeMatch) {
      const days = parseInt(daysBeforeMatch[1], 10);
      return new Date(ref.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const daysAfterMatch = text.match(/(\d+)\s*days?\s*after/i);
    if (daysAfterMatch) {
      const days = parseInt(daysAfterMatch[1], 10);
      return new Date(ref.getTime() + days * 24 * 60 * 60 * 1000);
    }

    // Weeks before/after pattern
    const weeksBeforeMatch = text.match(/(\d+|one|two|three|four)\s*weeks?\s*before/i);
    if (weeksBeforeMatch) {
      const wordMap: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
      const count = wordMap[weeksBeforeMatch[1]] || parseInt(weeksBeforeMatch[1], 10) || 1;
      return new Date(ref.getTime() - count * 7 * 24 * 60 * 60 * 1000);
    }

    // Months before pattern
    const monthsBeforeMatch = text.match(/(\d+|one|two)\s*months?\s*before/i);
    if (monthsBeforeMatch) {
      const wordMap: Record<string, number> = { one: 1, two: 2 };
      const count = wordMap[monthsBeforeMatch[1]] || parseInt(monthsBeforeMatch[1], 10) || 1;
      const target = new Date(ref);
      target.setMonth(target.getMonth() - count);
      return target;
    }

    return null;
  }

  static async create(
    eventId: string,
    userId: string,
    data: {
      title: string;
      dueDate: Date | string;
      description?: string;
      relatedTaskId?: string;
      status?: DeadlineStatus;
      source?: EntitySource;
    }
  ): Promise<IDeadline> {
    const deadline = await Deadline.create({
      eventId,
      userId,
      title: data.title,
      dueDate: new Date(data.dueDate),
      description: data.description,
      relatedTaskId: data.relatedTaskId,
      status: normalizeDeadlineStatus(data.status),
      source: data.source || 'MANUAL',
    });

    const formattedDate = deadline.dueDate.toISOString().split('T')[0];

    await ActivityService.log({
      eventId,
      userId,
      description: `Deadline created: "${deadline.title}" (Due: ${formattedDate})`,
      type: 'DEADLINE',
      entityType: 'deadline',
      entityId: deadline._id,
    });

    return deadline;
  }

  static async listByEvent(eventId: string): Promise<IDeadline[]> {
    return Deadline.find({ eventId }).sort({ dueDate: 1 }).lean();
  }

  static async getById(deadlineId: string, userId: string): Promise<IDeadline | null> {
    return Deadline.findOne({ _id: deadlineId, userId }).lean();
  }

  static async update(
    deadlineId: string,
    userId: string,
    updates: Partial<IDeadline>
  ): Promise<IDeadline | null> {
    const deadline = await Deadline.findOne({ _id: deadlineId, userId });
    if (!deadline) return null;

    if (updates.title) deadline.title = updates.title;
    if (updates.description !== undefined) deadline.description = updates.description;
    if (updates.dueDate) deadline.dueDate = new Date(updates.dueDate);
    if (updates.status) deadline.status = normalizeDeadlineStatus(updates.status);

    await deadline.save();

    await ActivityService.log({
      eventId: deadline.eventId,
      userId,
      description: `Deadline "${deadline.title}" updated [${deadline.status}]`,
      type: 'DEADLINE',
      entityType: 'deadline',
      entityId: deadline._id,
    });

    return deadline;
  }

  static async delete(deadlineId: string, userId: string): Promise<boolean> {
    const deadline = await Deadline.findOne({ _id: deadlineId, userId });
    if (!deadline) return false;

    await Deadline.deleteOne({ _id: deadlineId });

    await ActivityService.log({
      eventId: deadline.eventId,
      userId,
      description: `Deadline deleted: "${deadline.title}"`,
      type: 'DELETE',
      entityType: 'deadline',
    });

    return true;
  }
}
