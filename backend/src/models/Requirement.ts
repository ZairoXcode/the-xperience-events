import mongoose, { Document, Schema, Model } from 'mongoose';
import { IRequirement } from '../types';

export interface IRequirementDocument extends Omit<IRequirement, '_id'>, Document {}

const requirementSchema = new Schema<IRequirementDocument>(
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
      required: [true, 'Requirement title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Requirement category is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'FULFILLED'],
      default: 'PENDING',
    },
    notes: {
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

requirementSchema.index({ eventId: 1, category: 1 });
requirementSchema.index({ eventId: 1, status: 1 });

export const Requirement: Model<IRequirementDocument> = mongoose.model<IRequirementDocument>(
  'Requirement',
  requirementSchema
);
