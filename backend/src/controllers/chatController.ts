import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ChatMessage } from '../models';
import { AIService } from '../services/ai/aiService';
import { getParam } from '../utils/params';

export class ChatController {
  static async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      const messages = await ChatMessage.find({ eventId, userId })
        .sort({ createdAt: 1 })
        .lean();

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch chat history',
      });
    }
  }

  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'A message text is required.',
        });
        return;
      }

      const result = await AIService.processMessage({
        eventId,
        userId,
        userMessage: message.trim(),
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('[ChatController Error]:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process AI conversation message',
      });
    }
  }

  static async clearHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      // Only delete messages that belong to this authenticated user
      await ChatMessage.deleteMany({ eventId, userId });

      res.status(200).json({
        success: true,
        message: 'Chat history cleared successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to clear chat history',
      });
    }
  }
}
