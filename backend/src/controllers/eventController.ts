import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EventService } from '../services/event/eventService';
import { getParam } from '../utils/params';

export class EventController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const event = await EventService.create(userId, req.body);
      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create event',
      });
    }
  }

  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const events = await EventService.listByUser(userId);
      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch events',
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.id);
      const event = await EventService.getById(eventId, userId);

      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch event',
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.id);
      const updated = await EventService.update(eventId, userId, req.body, 'MANUAL');

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Event not found',
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
        error: error.message || 'Failed to update event',
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.id);
      const deleted = await EventService.delete(eventId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete event',
      });
    }
  }

  static async getSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.id);
      const summary = await EventService.getDashboardSummary(eventId, userId);

      if (!summary) {
        res.status(404).json({
          success: false,
          error: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to load dashboard summary',
      });
    }
  }
}
