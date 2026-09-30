import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { VendorService } from '../services/vendor/vendorService';
import { VendorCategory } from '../types';
import { getParam } from '../utils/params';

export class VendorController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = getParam(req.params.eventId);
      const vendor = await VendorService.create(eventId, userId, req.body);
      res.status(201).json({
        success: true,
        data: vendor,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add vendor',
      });
    }
  }

  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = getParam(req.params.eventId);
      const { category } = req.query;
      const vendors = await VendorService.listByEvent(
        eventId,
        category as VendorCategory
      );
      res.status(200).json({
        success: true,
        data: vendors,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list vendors',
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const vendorId = getParam(req.params.vendorId);
      const updated = await VendorService.update(vendorId, userId, req.body);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Vendor not found',
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
        error: error.message || 'Failed to update vendor',
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const vendorId = getParam(req.params.vendorId);
      const deleted = await VendorService.delete(vendorId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Vendor not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Vendor deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete vendor',
      });
    }
  }
}
