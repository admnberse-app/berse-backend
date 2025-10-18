import { body } from 'express-validator';

export const generateQRCodeValidators = [
  body('purpose')
    .notEmpty()
    .withMessage('Purpose is required')
    .isIn(['CONNECT', 'CHECKIN'])
    .withMessage('Purpose must be either CONNECT or CHECKIN'),
  body('eventId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Event ID must not be empty')
    .custom((value, { req }) => {
      if (req.body.purpose === 'CHECKIN' && !value) {
        throw new Error('Event ID is required when purpose is CHECKIN');
      }
      return true;
    }),
];

export const scanQRCodeValidators = [
  body('qrData')
    .notEmpty()
    .withMessage('QR code data is required')
    .isString()
    .withMessage('QR code data must be a string')
    .isLength({ min: 10 })
    .withMessage('Invalid QR code data'),
];
