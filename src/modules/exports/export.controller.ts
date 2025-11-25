/**
 * Export Controller
 * Handles HTTP requests for exports
 */

import { Request, Response } from 'express';
import { AppError } from '../../middleware/error';
import { ExportFormat, ExportOptions } from './export.types';
import { EventParticipantsExportService } from './event-participants-export.service';

export class ExportController {
  /**
   * Export event participants
   * GET /api/v2/exports/events/:eventId/participants
   */
  async exportEventParticipants(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const userId = (req as any).userId as string;
      
      // Parse query parameters
      const format = (req.query.format as ExportFormat) || 'excel';
      const filters = {
        status: req.query.status as string,
        hasCheckedIn: req.query.hasCheckedIn === 'true' ? true : req.query.hasCheckedIn === 'false' ? false : undefined,
        hasCanceled: req.query.hasCanceled === 'true' ? true : req.query.hasCanceled === 'false' ? false : undefined,
      };

      const options: ExportOptions = {
        format,
        filters,
        batchSize: req.query.batchSize ? parseInt(req.query.batchSize as string) : 1000,
      };

      // Create service and export
      const exportService = new EventParticipantsExportService(eventId);
      const result = await exportService.exportToStream(res, options, userId);

      // Response is already sent by the stream
      console.log(`Export completed: ${result.recordsExported} records exported`);
    } catch (error) {
      console.error('Export error:', error);
      
      if (!res.headersSent) {
        if (error instanceof AppError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to export data' });
        }
      }
    }
  }

  /**
   * Export users (example for future implementation)
   * GET /api/v2/exports/users
   */
  async exportUsers(req: Request, res: Response) {
    try {
      // TODO: Implement UsersExportService
      throw new AppError('Users export not yet implemented', 501);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to export data' });
      }
    }
  }

  /**
   * Export payments (example for future implementation)
   * GET /api/v2/exports/payments
   */
  async exportPayments(req: Request, res: Response) {
    try {
      // TODO: Implement PaymentsExportService
      throw new AppError('Payments export not yet implemented', 501);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to export data' });
      }
    }
  }
}

export const exportController = new ExportController();
