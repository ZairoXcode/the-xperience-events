import mongoose from 'mongoose';
import { Activity } from '../../models';
import { ActivityType, IActivity } from '../../types';

export class ActivityService {
  static async log(params: {
    eventId: string | mongoose.Types.ObjectId;
    userId: string | mongoose.Types.ObjectId;
    description: string;
    type: ActivityType;
    entityType?: 'event' | 'task' | 'vendor' | 'deadline' | 'requirement' | 'risk';
    entityId?: mongoose.Types.ObjectId;
    metadata?: Record<string, unknown>;
  }): Promise<IActivity> {
    const activity = await Activity.create({
      eventId: params.eventId,
      userId: params.userId,
      description: params.description,
      type: params.type,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata,
    });
    return activity;
  }

  static async getByEvent(
    eventId: string | mongoose.Types.ObjectId,
    limit = 50,
    userId?: string | mongoose.Types.ObjectId
  ): Promise<IActivity[]> {
    const query: Record<string, unknown> = { eventId };
    if (userId) query.userId = userId;
    return Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
