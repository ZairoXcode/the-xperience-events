import mongoose, { Document, Schema, Model } from 'mongoose';
import { IEvent } from '../types';

export interface IEventDocument extends Omit<IEvent, '_id'>, Document {}

const eventSchema = new Schema<IEventDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    guestCount: {
      type: Number,
      required: [true, 'Expected guest count is required'],
      min: [0, 'Guest count cannot be negative'],
      default: 0,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    activities: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['PLANNING', 'ACTIVE', 'COMPLETED'],
      default: 'PLANNING',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ userId: 1, createdAt: -1 });

export const Event: Model<IEventDocument> = mongoose.model<IEventDocument>('Event', eventSchema);
