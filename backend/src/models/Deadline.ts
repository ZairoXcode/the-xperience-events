import mongoose, { Document, Schema, Model } from 'mongoose';
import { IDeadline } from '../types';

export interface IDeadlineDocument extends Omit<IDeadline, '_id'>, Document {}

const deadlineSchema = new Schema<IDeadlineDocument>(
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
      required: [true, 'Deadline title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    relatedTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'OVERDUE', 'COMPLETED'],
      default: 'UPCOMING',
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

deadlineSchema.index({ eventId: 1, dueDate: 1 });
deadlineSchema.index({ eventId: 1, status: 1 });

export const Deadline: Model<IDeadlineDocument> = mongoose.model<IDeadlineDocument>('Deadline', deadlineSchema);
