import mongoose from 'mongoose';
import { Requirement } from '../../models';
import { IRequirement, RequirementStatus, EntitySource } from '../../types';
import { ActivityService } from '../activity/activityService';
import { normalizeRequirementStatus } from '../../utils/normalizers';

export class RequirementService {
  static async create(
    eventId: string,
    userId: string,
    data: {
      title: string;
      category: string;
      quantity?: number;
      status?: RequirementStatus;
      notes?: string;
      source?: EntitySource;
    }
  ): Promise<IRequirement> {
    const requirement = await Requirement.create({
      eventId,
      userId,
      title: data.title,
      category: data.category,
      quantity: data.quantity,
      status: normalizeRequirementStatus(data.status),
      notes: data.notes,
      source: data.source || 'MANUAL',
    });

    await ActivityService.log({
      eventId,
      userId,
      description: `Requirement noted: "${requirement.title}" (${requirement.category}${
        requirement.quantity ? ` - Qty: ${requirement.quantity}` : ''
      })`,
      type: 'REQUIREMENT',
      entityType: 'requirement',
      entityId: requirement._id,
    });

    return requirement;
  }

  static async listByEvent(eventId: string): Promise<IRequirement[]> {
    return Requirement.find({ eventId }).sort({ category: 1, createdAt: 1 }).lean();
  }

  static async getById(reqId: string, userId: string): Promise<IRequirement | null> {
    return Requirement.findOne({ _id: reqId, userId }).lean();
  }

  static async update(
    reqId: string,
    userId: string,
    updates: Partial<IRequirement>
  ): Promise<IRequirement | null> {
    const req = await Requirement.findOne({ _id: reqId, userId });
    if (!req) return null;

    if (updates.title) req.title = updates.title;
    if (updates.category) req.category = updates.category;
    if (updates.quantity !== undefined) req.quantity = updates.quantity;
    if (updates.status) req.status = normalizeRequirementStatus(updates.status);
    if (updates.notes !== undefined) req.notes = updates.notes;

    await req.save();

    await ActivityService.log({
      eventId: req.eventId,
      userId,
      description: `Requirement "${req.title}" updated [${req.status}]`,
      type: 'REQUIREMENT',
      entityType: 'requirement',
      entityId: req._id,
    });

    return req;
  }

  static async delete(reqId: string, userId: string): Promise<boolean> {
    const req = await Requirement.findOne({ _id: reqId, userId });
    if (!req) return false;

    await Requirement.deleteOne({ _id: reqId });

    await ActivityService.log({
      eventId: req.eventId,
      userId,
      description: `Requirement removed: "${req.title}"`,
      type: 'DELETE',
      entityType: 'requirement',
    });

    return true;
  }

  static async findOrCreateOrUpdate(
    eventId: string,
    userId: string,
    category: string,
    title: string,
    data: Partial<IRequirement>
  ): Promise<{ requirement: IRequirement; created: boolean }> {
    const regex = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    let existing = await Requirement.findOne({ eventId, category: regex });

    if (!existing) {
      const titleRegex = new RegExp(`^${title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      existing = await Requirement.findOne({ eventId, title: titleRegex });
    }

    if (existing) {
      if (data.quantity !== undefined) existing.quantity = data.quantity;
      if (data.status) existing.status = normalizeRequirementStatus(data.status);
      if (data.notes) existing.notes = data.notes;
      if (data.title) existing.title = data.title;
      await existing.save();
      return { requirement: existing, created: false };
    }

    const newReq = await this.create(eventId, userId, {
      title,
      category,
      quantity: data.quantity,
      status: data.status ? normalizeRequirementStatus(data.status) : 'PENDING',
      notes: data.notes,
      source: 'AI',
    });

    return { requirement: newReq, created: true };
  }
}
