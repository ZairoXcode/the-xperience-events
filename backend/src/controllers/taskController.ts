import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TaskService } from '../services/task/taskService';
import { TaskStatus, TaskPriority } from '../types';
import { getParam } from '../utils/params';

export class TaskController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      const task = await TaskService.create(eventId, userId, req.body);
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create task',
      });
    }
  }

  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = getParam(req.params.eventId);
      const { status, priority, category } = req.query;

      const tasks = await TaskService.listByEvent(eventId, {
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        category: category as string,
      });

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list tasks',
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = getParam(req.params.taskId);
      const updated = await TaskService.update(taskId, userId, req.body);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
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
        error: error.message || 'Failed to update task',
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = getParam(req.params.taskId);
      const deleted = await TaskService.delete(taskId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete task',
      });
    }
  }
}
