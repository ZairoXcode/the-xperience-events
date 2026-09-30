import mongoose from 'mongoose';
import { Vendor } from '../../models';
import { IVendor, VendorStatus, VendorCategory, EntitySource } from '../../types';
import { ActivityService } from '../activity/activityService';
import { normalizeVendorCategory, normalizeVendorStatus } from '../../utils/normalizers';

export class VendorService {
  static async create(
    eventId: string,
    userId: string,
    data: {
      name: string;
      category: VendorCategory;
      status?: VendorStatus;
      contactInfo?: { name?: string; phone?: string; email?: string };
      relatedActivities?: string[];
      notes?: string;
      source?: EntitySource;
    }
  ): Promise<IVendor> {
    const category = normalizeVendorCategory(data.category);
    const status = normalizeVendorStatus(data.status);
    const vendor = await Vendor.create({
      eventId,
      userId,
      name: data.name,
      category,
      status,
      contactInfo: data.contactInfo,
      relatedActivities: data.relatedActivities || [],
      notes: data.notes,
      source: data.source || 'MANUAL',
    });

    await ActivityService.log({
      eventId,
      userId,
      description: `Vendor added: "${vendor.name}" (${vendor.category}) [${vendor.status}]`,
      type: 'VENDOR',
      entityType: 'vendor',
      entityId: vendor._id,
      metadata: { status: vendor.status },
    });

    return vendor;
  }

  static async listByEvent(
    eventId: string,
    category?: VendorCategory
  ): Promise<IVendor[]> {
    const query: Record<string, unknown> = { eventId };
    if (category) query.category = category;
    return Vendor.find(query).sort({ category: 1, name: 1 }).lean();
  }

  static async getById(vendorId: string, userId: string): Promise<IVendor | null> {
    return Vendor.findOne({ _id: vendorId, userId }).lean();
  }

  static async update(
    vendorId: string,
    userId: string,
    updates: Partial<IVendor>
  ): Promise<IVendor | null> {
    const vendor = await Vendor.findOne({ _id: vendorId, userId });
    if (!vendor) return null;

    const oldStatus = vendor.status;

    if (updates.name) vendor.name = updates.name;
    if (updates.category) vendor.category = normalizeVendorCategory(updates.category);
    if (updates.status) vendor.status = normalizeVendorStatus(updates.status);
    if (updates.contactInfo) vendor.contactInfo = updates.contactInfo;
    if (updates.relatedActivities) vendor.relatedActivities = updates.relatedActivities;
    if (updates.notes !== undefined) vendor.notes = updates.notes;

    await vendor.save();

    if (updates.status && updates.status !== oldStatus) {
      await ActivityService.log({
        eventId: vendor.eventId,
        userId,
        description: `Vendor "${vendor.name}" status updated: ${oldStatus} → ${vendor.status}`,
        type: 'VENDOR',
        entityType: 'vendor',
        entityId: vendor._id,
      });
    }

    return vendor;
  }

  static async delete(vendorId: string, userId: string): Promise<boolean> {
    const vendor = await Vendor.findOne({ _id: vendorId, userId });
    if (!vendor) return false;

    await Vendor.deleteOne({ _id: vendorId });

    await ActivityService.log({
      eventId: vendor.eventId,
      userId,
      description: `Vendor removed: "${vendor.name}"`,
      type: 'DELETE',
      entityType: 'vendor',
    });

    return true;
  }

  static async findOrCreateOrUpdateByCategoryOrName(
    eventId: string,
    userId: string,
    query: { category?: VendorCategory; name?: string },
    data: Partial<IVendor>
  ): Promise<{ vendor: IVendor; created: boolean }> {
    let existing = null;

    if (query.name) {
      const regex = new RegExp(`^${query.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      existing = await Vendor.findOne({ eventId, name: regex });
    }

    const normQueryCat = query.category ? normalizeVendorCategory(query.category) : undefined;
    if (!existing && normQueryCat) {
      existing = await Vendor.findOne({ eventId, category: normQueryCat });
    }

    if (existing) {
      if (data.status) existing.status = normalizeVendorStatus(data.status);
      if (data.name) existing.name = data.name;
      if (data.category) existing.category = normalizeVendorCategory(data.category);
      if (data.notes) existing.notes = data.notes;
      if (data.relatedActivities && data.relatedActivities.length > 0) {
        existing.relatedActivities = Array.from(
          new Set([...existing.relatedActivities, ...data.relatedActivities])
        );
      }
      await existing.save();
      return { vendor: existing, created: false };
    }

    const newVendor = await this.create(eventId, userId, {
      name: data.name || (normQueryCat ? `${normQueryCat} Vendor` : 'General Vendor'),
      category: data.category || normQueryCat || 'Other',
      status: data.status || 'PENDING',
      relatedActivities: data.relatedActivities || [],
      notes: data.notes,
      source: 'AI',
    });

    return { vendor: newVendor, created: true };
  }
}
