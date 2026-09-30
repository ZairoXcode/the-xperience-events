import mongoose, { Document, Schema, Model } from 'mongoose';
import { IActivity, ActivityType } from '../types';

export interface IActivityDocument extends Omit<IActivity, '_id'>, Document {}

const activityTypes: ActivityType[] = [
  'UPDATE',
  'CREATE',
  'DELETE',
  'RISK',
  'DEADLINE',
  'VENDOR',
  'TASK',
  'REQUIREMENT',
];

const activitySchema = new Schema<IActivityDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: activityTypes,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['event', 'task', 'vendor', 'deadline', 'requirement', 'risk'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ eventId: 1, createdAt: -1 });

export const Activity: Model<IActivityDocument> = mongoose.model<IActivityDocument>(
  'Activity',
  activitySchema
);
