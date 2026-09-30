import mongoose, { Document, Schema, Model } from 'mongoose';
import { IChatMessage } from '../types';

export interface IChatMessageDocument extends Omit<IChatMessage, '_id'>, Document {}

const chatMessageSchema = new Schema<IChatMessageDocument>(
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
    role: {
      type: String,
      enum: ['USER', 'ASSISTANT'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    structuredActions: {
      type: Schema.Types.Mixed,
    },
    appliedChanges: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ eventId: 1, createdAt: 1 });

export const ChatMessage: Model<IChatMessageDocument> = mongoose.model<IChatMessageDocument>(
  'ChatMessage',
  chatMessageSchema
);
