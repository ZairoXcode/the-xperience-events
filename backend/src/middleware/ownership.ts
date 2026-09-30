import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from './auth';
import { Event } from '../models';
import { getParam } from '../utils/params';

export const requireEventAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = getParam(req.params.eventId || req.params.id);

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        error: 'A valid eventId parameter is required.',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated.',
      });
      return;
    }

    const event = await Event.findOne({
      _id: eventId,
      userId: req.user.id,
    });

    if (!event) {
      res.status(404).json({
        success: false,
        error: 'Event not found or you do not have permission to access it.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error verifying event access permissions.',
    });
  }
};
