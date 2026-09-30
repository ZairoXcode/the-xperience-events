import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DeadlineService } from '../services/deadline/deadlineService';
import { getParam } from '../utils/params';

export class DeadlinesController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      const deadline = await DeadlineService.create(eventId, userId, req.body);
      res.status(201).json({
        success: true,
        data: deadline,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create deadline',
      });
    }
  }

  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = getParam(req.params.eventId);
      const deadlines = await DeadlineService.listByEvent(eventId);
      res.status(200).json({
        success: true,
        data: deadlines,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list deadlines',
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const deadlineId = getParam(req.params.deadlineId);
      const updated = await DeadlineService.update(deadlineId, userId, req.body);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Deadline not found',
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
        error: error.message || 'Failed to update deadline',
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const deadlineId = getParam(req.params.deadlineId);
      const deleted = await DeadlineService.delete(deadlineId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Deadline not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Deadline deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete deadline',
      });
    }
  }
}
