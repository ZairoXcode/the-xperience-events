import mongoose, { Document, Schema, Model } from 'mongoose';
import { ITask } from '../types';

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

const taskSchema = new Schema<ITaskDocument>(
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
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
      default: 'TODO',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    dueDate: {
      type: Date,
    },
    category: {
      type: String,
      trim: true,
    },
    relatedVendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    relatedActivity: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['MANUAL', 'AI'],
      default: 'MANUAL',
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ eventId: 1, status: 1 });
taskSchema.index({ eventId: 1, createdAt: -1 });

export const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>('Task', taskSchema);
