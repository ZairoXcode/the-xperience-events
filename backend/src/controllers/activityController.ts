import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ActivityService } from '../services/activity/activityService';
import { getParam } from '../utils/params';

export class ActivityController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const activities = await ActivityService.getByEvent(eventId, limit, userId);

      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch event activities',
      });
    }
  }
}
