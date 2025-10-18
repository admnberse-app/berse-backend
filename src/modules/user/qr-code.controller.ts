import { Request, Response } from 'express';
import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { QRCodeService } from './qr-code.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { QRCodeGenerateRequest, QRCodeScanRequest } from './qr-code.types';

export class QRCodeController {
  /**
   * Generate QR code for user
   * POST /v2/users/me/qr-code
   */
  static async generateQRCode(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { purpose, eventId } = req.body as QRCodeGenerateRequest;

    const qrCode = await QRCodeService.generateQRCode(userId, { purpose, eventId });

    sendSuccess(res, qrCode, 'QR code generated successfully', 201);
  }

  /**
   * Validate QR code (general validation)
   * POST /v2/users/qr-code/validate
   */
  static async validateQRCode(req: Request, res: Response): Promise<void> {
    const { qrData } = req.body as QRCodeScanRequest;

    if (!qrData) {
      throw new AppError('QR code data is required', 400);
    }

    const result = await QRCodeService.validateQRCode(qrData);

    sendSuccess(res, result, 'QR code validated successfully');
  }

  /**
   * Generate QR code as PNG image
   * POST /v2/users/me/qr-code/image
   */
  static async generateQRCodeImage(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { purpose, eventId, size = 300 } = req.body as QRCodeGenerateRequest & { size?: number };

    // Generate QR code data
    const qrCode = await QRCodeService.generateQRCode(userId, { purpose, eventId });

    // Generate QR code image as PNG buffer with high error correction for logo overlay
    const qrImage = await QRCode.toBuffer(qrCode.qrData, {
      type: 'png',
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error correction allows ~30% data loss
    });

    // Add logo overlay in the center
    let finalImage = qrImage;
    
    try {
      // Path to logo - try multiple locations
      const possibleLogoPaths = [
        path.join(process.cwd(), 'Berse App Logo', 'Berse App Emblem.png'),
        path.join(process.cwd(), 'public', 'assets', 'logos', 'berse-email-logo.png'),
        path.join(process.cwd(), 'frontend', 'public', 'berse-emblem.png')
      ];

      let logoPath: string | null = null;
      for (const p of possibleLogoPaths) {
        if (fs.existsSync(p)) {
          logoPath = p;
          break;
        }
      }

      if (logoPath) {
        // Calculate logo size (30% of QR code size for better visibility)
        const logoSize = Math.floor(size * 0.3);
        
        // Resize logo and add white circular background
        const logo = await sharp(logoPath)
          .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .trim() // Remove any transparent padding from the logo
          .extend({
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toBuffer();

        // Create white circle background for logo (minimal padding)
        const circleSize = Math.floor(logoSize * 1.05); // Reduced from 1.15 to 1.05
        const circleSvg = `
          <svg width="${circleSize}" height="${circleSize}">
            <circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${circleSize / 2}" fill="white"/>
          </svg>
        `;
        const circleBuffer = Buffer.from(circleSvg);

        // Composite: QR code + white circle + logo
        finalImage = await sharp(qrImage)
          .composite([
            {
              input: circleBuffer,
              top: Math.floor((size - circleSize) / 2),
              left: Math.floor((size - circleSize) / 2)
            },
            {
              input: logo,
              top: Math.floor((size - logoSize) / 2),
              left: Math.floor((size - logoSize) / 2)
            }
          ])
          .png()
          .toBuffer();
      }
    } catch (error) {
      // If logo overlay fails, continue with QR code only
      console.warn('Failed to add logo to QR code:', error);
    }

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', finalImage.length.toString());
    res.setHeader('X-QR-Expires-In', qrCode.expiresIn.toString());
    res.setHeader('X-QR-Purpose', qrCode.purpose);
    if (qrCode.eventId) {
      res.setHeader('X-QR-Event-Id', qrCode.eventId);
    }

    // Send image
    res.send(finalImage);
  }
}
