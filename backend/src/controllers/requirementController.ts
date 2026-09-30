import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RequirementService } from '../services/requirement/requirementService';
import { getParam } from '../utils/params';

export class RequirementController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      const reqDoc = await RequirementService.create(eventId, userId, req.body);
      res.status(201).json({
        success: true,
        data: reqDoc,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to record requirement',
      });
    }
  }

  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = getParam(req.params.eventId);
      const items = await RequirementService.listByEvent(eventId);
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list requirements',
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const reqId = getParam(req.params.reqId);
      const updated = await RequirementService.update(reqId, userId, req.body);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Requirement not found',
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
        error: error.message || 'Failed to update requirement',
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const reqId = getParam(req.params.reqId);
      const deleted = await RequirementService.delete(reqId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Requirement not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Requirement deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete requirement',
      });
    }
  }
}
