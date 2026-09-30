import mongoose, { Document, Schema, Model } from 'mongoose';
import { IVendor, VendorCategory, VendorStatus } from '../types';

export interface IVendorDocument extends Omit<IVendor, '_id'>, Document {}

const vendorCategories: VendorCategory[] = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography',
  'Entertainment',
  'Accommodation',
  'Transportation',
  'Invitations',
  'Other',
];

const vendorStatuses: VendorStatus[] = [
  'PENDING',
  'CONTACTED',
  'CONFIRMED',
  'UNAVAILABLE',
  'CANCELLED',
];

const vendorSchema = new Schema<IVendorDocument>(
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
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: vendorCategories,
      required: [true, 'Vendor category is required'],
    },
    status: {
      type: String,
      enum: vendorStatuses,
      default: 'PENDING',
    },
    contactInfo: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    relatedActivities: {
      type: [String],
      default: [],
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

vendorSchema.index({ eventId: 1, category: 1 });
vendorSchema.index({ eventId: 1, status: 1 });

export const Vendor: Model<IVendorDocument> = mongoose.model<IVendorDocument>('Vendor', vendorSchema);
