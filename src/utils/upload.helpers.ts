import { Request } from 'express';
import { AppError } from '../middleware/error';
import logger from './logger';

/**
 * Validate uploaded file
 */
export const validateUploadedFile = (req: Request, allowedTypes?: string[], maxSize?: number): Express.Multer.File => {
  const file = req.file;

  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  // Check file type
  if (allowedTypes) {
    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    const mimeTypeValid = allowedTypes.some(type => file.mimetype.includes(type));
    const extValid = fileExt && allowedTypes.includes(fileExt);

    if (!mimeTypeValid && !extValid) {
      throw new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400);
    }
  }

  // Check file size
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new AppError(`File size exceeds maximum allowed size of ${maxSizeMB}MB`, 400);
  }

  return file;
};

/**
 * Validate multiple uploaded files
 */
export const validateUploadedFiles = (
  req: Request,
  maxFiles?: number,
  allowedTypes?: string[],
  maxSize?: number
): Express.Multer.File[] => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  // Check max files
  if (maxFiles && files.length > maxFiles) {
    throw new AppError(`Maximum ${maxFiles} files allowed`, 400);
  }

  // Validate each file
  files.forEach(file => {
    // Check file type
    if (allowedTypes) {
      const fileExt = file.originalname.split('.').pop()?.toLowerCase();
      const mimeTypeValid = allowedTypes.some(type => file.mimetype.includes(type));
      const extValid = fileExt && allowedTypes.includes(fileExt);

      if (!mimeTypeValid && !extValid) {
        throw new AppError(`Invalid file type for ${file.originalname}. Allowed types: ${allowedTypes.join(', ')}`, 400);
      }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new AppError(`File ${file.originalname} exceeds maximum allowed size of ${maxSizeMB}MB`, 400);
    }
  });

  return files;
};

/**
 * Get file extension from filename or mimetype
 */
export const getFileExtension = (file: Express.Multer.File): string => {
  // First try to get from original filename
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (ext) return ext;

  // Fallback to mimetype
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };

  return mimeMap[file.mimetype] || 'bin';
};

/**
 * Check if file is an image
 */
export const isImage = (file: Express.Multer.File): boolean => {
  return file.mimetype.startsWith('image/');
};

/**
 * Check if file is a document
 */
export const isDocument = (file: Express.Multer.File): boolean => {
  const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
  return documentTypes.some(type => file.mimetype.includes(type));
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Sanitize filename (remove special characters)
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .toLowerCase();
};

/**
 * Log upload activity
 */
export const logUploadActivity = (
  userId: string,
  file: Express.Multer.File,
  folder: string,
  url: string
): void => {
  logger.info('File uploaded', {
    userId,
    fileName: file.originalname,
    fileSize: formatFileSize(file.size),
    mimeType: file.mimetype,
    folder,
    url,
  });
};

/**
 * File type constants
 */
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

/**
 * File size constants (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  AVATAR: 2 * 1024 * 1024, // 2MB
};
