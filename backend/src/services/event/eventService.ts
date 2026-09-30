import mongoose from 'mongoose';
import {
  Event,
  Task,
  Vendor,
  Deadline,
  Requirement,
  Risk,
  ChatMessage,
  Activity,
} from '../../models';
import { IEvent } from '../../types';
import { ActivityService } from '../activity/activityService';
import { CreateEventInput, UpdateEventInput } from '../../validators/eventValidators';

export interface EventDashboardSummary {
  event: IEvent;
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    blocked: number;
  };
  risks: {
    total: number;
    open: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vendors: {
    total: number;
    confirmed: number;
    pending: number;
    contacted: number;
    unavailable: number;
  };
  requirements: {
    total: number;
    pending: number;
    fulfilled: number;
  };
  deadlines: {
    total: number;
    upcoming: number;
    overdue: number;
  };
}

export class EventService {
  static async create(userId: string, input: CreateEventInput): Promise<IEvent> {
    const event = await Event.create({
      userId,
      name: input.name,
      type: input.type,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      guestCount: input.guestCount,
      location: input.location,
      description: input.description,
      activities: input.activities || [],
      status: 'PLANNING',
    });

    await ActivityService.log({
      eventId: event._id,
      userId,
      description: `Event "${event.name}" created`,
      type: 'CREATE',
      entityType: 'event',
      entityId: event._id,
    });

    return event;
  }

  static async listByUser(userId: string): Promise<IEvent[]> {
    return Event.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  static async getById(eventId: string, userId: string): Promise<IEvent | null> {
    return Event.findOne({ _id: eventId, userId }).lean();
  }

  static async update(
    eventId: string,
    userId: string,
    input: UpdateEventInput,
    source: 'MANUAL' | 'AI' = 'MANUAL'
  ): Promise<IEvent | null> {
    const current = await Event.findOne({ _id: eventId, userId });
    if (!current) return null;

    const changes: string[] = [];

    if (input.guestCount !== undefined && input.guestCount !== current.guestCount) {
      changes.push(`Guest count updated from ${current.guestCount} → ${input.guestCount}`);
      current.guestCount = input.guestCount;
    }

    if (input.name && input.name !== current.name) {
      changes.push(`Event name updated to "${input.name}"`);
      current.name = input.name;
    }

    if (input.location && input.location !== current.location) {
      changes.push(`Location updated to "${input.location}"`);
      current.location = input.location;
    }

    if (input.type && input.type !== current.type) {
      current.type = input.type;
    }

    if (input.startDate) current.startDate = new Date(input.startDate);
    if (input.endDate) current.endDate = new Date(input.endDate);
    if (input.description !== undefined) current.description = input.description;
    if (input.status && input.status !== current.status) {
      changes.push(`Event status updated: ${current.status} → ${input.status}`);
      current.status = input.status;
    }

    if (input.activities && Array.isArray(input.activities)) {
      const newActivities = input.activities.filter(
        (a) => !current.activities.includes(a)
      );
      if (newActivities.length > 0) {
        current.activities = Array.from(new Set([...current.activities, ...input.activities]));
        changes.push(`Added activities: ${newActivities.join(', ')}`);
      }
    }

    await current.save();

    for (const change of changes) {
      await ActivityService.log({
        eventId: current._id,
        userId,
        description: change,
        type: 'UPDATE',
        entityType: 'event',
        entityId: current._id,
        metadata: { source },
      });
    }

    return current;
  }

  static async delete(eventId: string, userId: string): Promise<boolean> {
    const result = await Event.deleteOne({ _id: eventId, userId });
    if (result.deletedCount > 0) {
      // Clean up all related sub-collections to prevent orphaned records
      await Promise.all([
        Task.deleteMany({ eventId }),
        Vendor.deleteMany({ eventId }),
        Deadline.deleteMany({ eventId }),
        Requirement.deleteMany({ eventId }),
        Risk.deleteMany({ eventId }),
        ChatMessage.deleteMany({ eventId }),
        Activity.deleteMany({ eventId }),
      ]);
      return true;
    }
    return false;
  }

  static async getDashboardSummary(
    eventId: string,
    userId: string
  ): Promise<EventDashboardSummary | null> {
    const event = await Event.findOne({ _id: eventId, userId }).lean();
    if (!event) return null;

    const [tasks, risks, vendors, requirements, deadlines] = await Promise.all([
      Task.find({ eventId }).lean(),
      Risk.find({ eventId }).lean(),
      Vendor.find({ eventId }).lean(),
      Requirement.find({ eventId }).lean(),
      Deadline.find({ eventId }).lean(),
    ]);

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      blocked: tasks.filter((t) => t.status === 'BLOCKED').length,
    };

    const riskStats = {
      total: risks.length,
      open: risks.filter((r) => r.status === 'OPEN').length,
      critical: risks.filter((r) => r.severity === 'CRITICAL' && r.status !== 'RESOLVED').length,
      high: risks.filter((r) => r.severity === 'HIGH' && r.status !== 'RESOLVED').length,
      medium: risks.filter((r) => r.severity === 'MEDIUM' && r.status !== 'RESOLVED').length,
      low: risks.filter((r) => r.severity === 'LOW' && r.status !== 'RESOLVED').length,
    };

    const vendorStats = {
      total: vendors.length,
      confirmed: vendors.filter((v) => v.status === 'CONFIRMED').length,
      pending: vendors.filter((v) => v.status === 'PENDING').length,
      contacted: vendors.filter((v) => v.status === 'CONTACTED').length,
      unavailable: vendors.filter((v) => v.status === 'UNAVAILABLE').length,
    };

    const reqStats = {
      total: requirements.length,
      pending: requirements.filter((r) => r.status === 'PENDING').length,
      fulfilled: requirements.filter((r) => r.status === 'FULFILLED').length,
    };

    const now = new Date();
    const deadlineStats = {
      total: deadlines.length,
      upcoming: deadlines.filter(
        (d) => d.status === 'UPCOMING' && new Date(d.dueDate) >= now
      ).length,
      overdue: deadlines.filter(
        (d) => d.status === 'UPCOMING' && new Date(d.dueDate) < now
      ).length,
    };

    return {
      event,
      tasks: taskStats,
      risks: riskStats,
      vendors: vendorStats,
      requirements: reqStats,
      deadlines: deadlineStats,
    };
  }
}
