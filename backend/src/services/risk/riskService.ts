import mongoose from 'mongoose';
import { Risk } from '../../models';
import { IRisk, RiskSeverity, RiskStatus } from '../../types';
import { ActivityService } from '../activity/activityService';
import { normalizeRiskSeverity, normalizeRiskStatus } from '../../utils/normalizers';

export class RiskService {
  static async create(
    eventId: string,
    userId: string,
    data: {
      title: string;
      description: string;
      severity: RiskSeverity;
      status?: RiskStatus;
      affectedArea?: string;
      suggestedAction?: string;
      sourceConversation?: string;
    }
  ): Promise<IRisk> {
    const severity = normalizeRiskSeverity(data.severity);
    const status = normalizeRiskStatus(data.status);

    // Avoid exact duplicate open risks
    const existing = await Risk.findOne({
      eventId,
      title: { $regex: new RegExp(`^${data.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      status: { $in: ['OPEN', 'ACKNOWLEDGED'] },
    });

    if (existing) {
      existing.description = data.description;
      existing.severity = severity;
      if (data.suggestedAction) existing.suggestedAction = data.suggestedAction;
      if (data.affectedArea) existing.affectedArea = data.affectedArea;
      await existing.save();
      return existing;
    }

    const risk = await Risk.create({
      eventId,
      userId,
      title: data.title,
      description: data.description,
      severity,
      status,
      affectedArea: data.affectedArea,
      suggestedAction: data.suggestedAction,
      sourceConversation: data.sourceConversation,
    });

    await ActivityService.log({
      eventId,
      userId,
      description: `⚠ Risk identified: "${risk.title}" [${risk.severity}]`,
      type: 'RISK',
      entityType: 'risk',
      entityId: risk._id,
      metadata: { severity: risk.severity, affectedArea: risk.affectedArea },
    });

    return risk;
  }

  static async listByEvent(
    eventId: string,
    status?: RiskStatus
  ): Promise<IRisk[]> {
    const query: Record<string, unknown> = { eventId };
    if (status) query.status = status;
    return Risk.find(query).sort({ createdAt: -1 }).lean();
  }

  static async getById(riskId: string, userId: string): Promise<IRisk | null> {
    return Risk.findOne({ _id: riskId, userId }).lean();
  }

  static async updateStatus(
    riskId: string,
    userId: string,
    status: RiskStatus,
    suggestedAction?: string
  ): Promise<IRisk | null> {
    const risk = await Risk.findOne({ _id: riskId, userId });
    if (!risk) return null;

    const normStatus = normalizeRiskStatus(status);
    const oldStatus = risk.status;
    risk.status = normStatus;
    if (suggestedAction) risk.suggestedAction = suggestedAction;

    await risk.save();

    await ActivityService.log({
      eventId: risk.eventId,
      userId,
      description: `Risk "${risk.title}" status updated: ${oldStatus} → ${risk.status}`,
      type: 'RISK',
      entityType: 'risk',
      entityId: risk._id,
    });

    return risk;
  }

  /**
   * Deterministic capacity risk detector:
   * e.g., totalNeeded > providedCapacity => creates/updates a capacity shortage risk
   */
  static async detectCapacityRisk(params: {
    eventId: string;
    userId: string;
    category: string;
    needed: number;
    capacity: number;
    sourcePhrase?: string;
  }): Promise<IRisk | null> {
    if (params.capacity < params.needed) {
      const shortage = params.needed - params.capacity;
      return this.create(params.eventId, params.userId, {
        title: `${params.category} capacity shortage`,
        description: `Capacity gap detected: ${params.capacity} supported vs ${params.needed} needed. ${shortage} attendees are currently not covered.`,
        severity: shortage > 30 ? 'HIGH' : 'MEDIUM',
        affectedArea: params.category,
        suggestedAction: `Arrange additional vehicles or another ${params.category.toLowerCase()} vendor to cover the remaining ${shortage} attendees.`,
        sourceConversation: params.sourcePhrase,
      });
    }
    return null;
  }
}
