import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RiskService } from '../services/risk/riskService';
import { RiskStatus } from '../types';
import { getParam } from '../utils/params';

export class RiskController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = getParam(req.params.eventId);
      const { status } = req.query;
      const risks = await RiskService.listByEvent(
        eventId,
        status as RiskStatus
      );
      res.status(200).json({
        success: true,
        data: risks,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list risks',
      });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const riskId = getParam(req.params.riskId);
      const { status, suggestedAction } = req.body;

      const updated = await RiskService.updateStatus(
        riskId,
        userId,
        status,
        suggestedAction
      );

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Risk not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update risk',
      });
    }
  }
}
