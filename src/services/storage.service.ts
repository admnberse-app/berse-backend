import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { config } from '../config';
import logger from '../utils/logger';
import path from 'path';
import crypto from 'crypto';

/**
 * Digital Ocean Spaces Storage Service
 * S3-compatible storage for file uploads with automatic image optimization
 */
export class StorageService {
  private s3Client: S3Client | null = null;
  private bucket: string;
  private region: string;
  private cdnEndpoint?: string;
  private isConfigured: boolean = false;

  /**
   * MIME type mapping for correct Content-Type headers
   * Critical for proper image display in browsers
   */
  private readonly mimeTypes: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon',
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    // Other
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
  };

  constructor() {
    this.bucket = config.spaces.bucket || '';
    this.region = config.spaces.region || 'sgp1';
    this.cdnEndpoint = config.spaces.cdnEndpoint;

    // Check if Spaces is configured
    if (!this.bucket || !config.spaces.accessKeyId || !config.spaces.secretAccessKey) {
      logger.warn('Digital Ocean Spaces not configured - upload features will be disabled', {
        hasBucket: !!this.bucket,
        hasAccessKey: !!config.spaces.accessKeyId,
        hasSecretKey: !!config.spaces.secretAccessKey,
      });
      this.isConfigured = false;
      return;
    }

    try {
      this.s3Client = new S3Client({
        endpoint: config.spaces.endpoint,
        region: this.region,
        credentials: {
          accessKeyId: config.spaces.accessKeyId,
          secretAccessKey: config.spaces.secretAccessKey,
        },
        forcePathStyle: false, // Digital Ocean Spaces uses virtual hosted-style URLs
      });

      this.isConfigured = true;

      logger.info('Storage service initialized', {
        bucket: this.bucket,
        region: this.region,
        endpoint: config.spaces.endpoint,
        hasCDN: !!this.cdnEndpoint,
      });
    } catch (error) {
      logger.error('Failed to initialize Storage service', { error });
      this.isConfigured = false;
    }
  }

  /**
   * Check if Spaces is properly configured
   */
  private ensureConfigured(): void {
    if (!this.isConfigured || !this.s3Client) {
      throw new Error('Digital Ocean Spaces is not properly configured. Please check your environment variables.');
    }
  }

  /**
   * Generate a unique filename
   */
  private generateFileName(originalName: string, prefix?: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const randomString = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const fileName = `${timestamp}-${randomString}${ext}`;
    
    return prefix ? `${prefix}/${fileName}` : fileName;
  }

  /**
   * Get MIME type from file extension
   * Ensures correct Content-Type header for proper browser handling
   */
  private getMimeType(fileName: string, fallbackMimeType?: string): string {
    const ext = path.extname(fileName).toLowerCase();
    return this.mimeTypes[ext] || fallbackMimeType || 'application/octet-stream';
  }

  /**
   * Optimize image before upload
   */
  private async optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    try {
      const isImage = mimeType.startsWith('image/');
      
      if (!isImage) {
        return buffer;
      }

      // Convert to WebP for better compression, or keep original format
      const sharpInstance = sharp(buffer);
      const metadata = await sharpInstance.metadata();

      // Resize if image is too large (max 2048px on longest side)
      let optimized = sharpInstance;
      
      if (metadata.width && metadata.height) {
        const maxDimension = 2048;
        if (metadata.width > maxDimension || metadata.height > maxDimension) {
          optimized = optimized.resize(maxDimension, maxDimension, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }
      }

      // Optimize based on format
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        return await optimized.jpeg({ quality: 85, progressive: true }).toBuffer();
      } else if (mimeType === 'image/png') {
        return await optimized.png({ compressionLevel: 9, progressive: true }).toBuffer();
      } else if (mimeType === 'image/webp') {
        return await optimized.webp({ quality: 85 }).toBuffer();
      } else if (mimeType === 'image/gif') {
        // For GIFs, just pass through (sharp doesn't handle animated GIFs well)
        return buffer;
      }

      // Default: convert to WebP for best compression
      return await optimized.webp({ quality: 85 }).toBuffer();
    } catch (error) {
      logger.warn('Image optimization failed, using original', { error });
      return buffer;
    }
  }

  /**
   * Upload file to Digital Ocean Spaces
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: 'avatars' | 'events' | 'communities' | 'marketplace' | 'berseguide' | 'temp',
    options?: {
      optimize?: boolean;
      isPublic?: boolean;
      userId?: string;
      entityId?: string;
    }
  ): Promise<{ url: string; key: string; size: number }> {
    this.ensureConfigured();
    
    try {
      const { optimize = true, isPublic = true, userId, entityId } = options || {};

      // Build folder path
      let folderPath = folder;
      if (userId) {
        folderPath += `/${userId}`;
      }
      if (entityId) {
        folderPath += `/${entityId}`;
      }

      // Generate unique filename
      const key = this.generateFileName(file.originalname, folderPath);

      // Optimize image if enabled
      let fileBuffer = file.buffer;
      if (optimize && file.mimetype.startsWith('image/')) {
        fileBuffer = await this.optimizeImage(file.buffer, file.mimetype);
      }

      // Determine content type (might change after optimization)
      let contentType = this.getMimeType(key, file.mimetype);
      if (optimize && file.mimetype.startsWith('image/') && !file.mimetype.includes('gif')) {
        // Check if we converted to WebP
        const optimizedMeta = await sharp(fileBuffer).metadata();
        if (optimizedMeta.format === 'webp') {
          contentType = 'image/webp';
        }
      }

      // Upload to Spaces
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType, // Critical: ensures correct MIME type
        ContentDisposition: contentType.startsWith('image/') ? 'inline' : 'attachment', // Display images inline
        ACL: isPublic ? 'public-read' : 'private',
        CacheControl: 'public, max-age=31536000', // 1 year cache
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          ...(userId && { userId }),
          ...(entityId && { entityId }),
        },
      });

      await this.s3Client!.send(command);

      // Generate URL (use CDN if available)
      const url = this.getPublicUrl(key);

      logger.info('File uploaded successfully', {
        key,
        size: fileBuffer.length,
        originalSize: file.size,
        compressionRatio: ((1 - fileBuffer.length / file.size) * 100).toFixed(2) + '%',
        contentType,
      });

      return {
        url,
        key,
        size: fileBuffer.length,
      };
    } catch (error: any) {
      logger.error('File upload failed', { 
        error: error.message,
        errorName: error.name,
        errorCode: error.$metadata?.httpStatusCode,
        errorStack: error.stack,
        fileName: file.originalname,
        bucket: this.bucket,
        region: this.region,
        endpoint: config.spaces.endpoint,
      });
      
      // Provide more specific error messages
      if (error.name === 'CredentialsProviderError') {
        throw new Error('Storage credentials are invalid or missing');
      }
      if (error.$metadata?.httpStatusCode === 403) {
        throw new Error('Storage access denied - check credentials and bucket permissions');
      }
      if (error.$metadata?.httpStatusCode === 404) {
        throw new Error('Storage bucket not found - check bucket name and region');
      }
      
      throw new Error(`Failed to upload file to storage: ${error.name || 'UnknownError'} - ${error.message || 'No error message'}`);
    }
  }

  /**
   * Delete file from Digital Ocean Spaces
   */
  async deleteFile(key: string): Promise<void> {
    this.ensureConfigured();
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client!.send(command);
      logger.info('File deleted successfully', { key });
    } catch (error) {
      logger.error('File deletion failed', { error, key });
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Generate a signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    this.ensureConfigured();
    
    try{
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client!, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error('Failed to generate signed URL', { error, key });
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    // Use CDN endpoint if available
    if (this.cdnEndpoint) {
      return `${this.cdnEndpoint}/${key}`;
    }

    // Use direct Spaces URL
    return `https://${this.bucket}.${this.region}.digitaloceanspaces.com/${key}`;
  }

  /**
   * Extract key from URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      // Handle CDN URLs
      if (this.cdnEndpoint && url.startsWith(this.cdnEndpoint)) {
        return url.replace(`${this.cdnEndpoint}/`, '');
      }

      // Handle direct Spaces URLs
      const spacesUrlPattern = new RegExp(`https://${this.bucket}\\.${this.region}\\.digitaloceanspaces\\.com/(.+)`);
      const match = url.match(spacesUrlPattern);
      
      return match ? match[1] : null;
    } catch (error) {
      logger.error('Failed to extract key from URL', { error, url });
      return null;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: 'avatars' | 'events' | 'communities' | 'marketplace' | 'temp',
    options?: {
      optimize?: boolean;
      isPublic?: boolean;
      userId?: string;
      entityId?: string;
    }
  ): Promise<Array<{ url: string; key: string; size: number }>> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder, options));
    return await Promise.all(uploadPromises);
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteFile(key));
    await Promise.all(deletePromises);
  }
}

// Export singleton instance
export const storageService = new StorageService();
