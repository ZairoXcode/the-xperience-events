import mongoose, { Document, Schema, Model } from 'mongoose';
import { IRisk } from '../types';

export interface IRiskDocument extends Omit<IRisk, '_id'>, Document {}

const riskSchema = new Schema<IRiskDocument>(
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
      required: [true, 'Risk title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Risk description is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'OPEN',
    },
    affectedArea: {
      type: String,
      trim: true,
    },
    suggestedAction: {
      type: String,
      trim: true,
    },
    sourceConversation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

riskSchema.index({ eventId: 1, status: 1 });
riskSchema.index({ eventId: 1, severity: 1 });

export const Risk: Model<IRiskDocument> = mongoose.model<IRiskDocument>('Risk', riskSchema);
