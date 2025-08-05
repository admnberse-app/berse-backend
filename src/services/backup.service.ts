import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { logger } from '../utils/logger';
import { cacheService } from './cache.service';

interface BackupConfig {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  storage: {
    path: string;
    retention: {
      daily: number;    // Keep daily backups for X days
      weekly: number;   // Keep weekly backups for X weeks
      monthly: number;  // Keep monthly backups for X months
    };
  };
  compression: boolean;
  encryption: {
    enabled: boolean;
    key?: string;
  };
}

interface BackupInfo {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
  status: 'completed' | 'failed' | 'in_progress';
  duration: number; // in milliseconds
  tables?: string[];
}

class BackupService {
  private config: BackupConfig;
  private backupDir: string;

  constructor() {
    this.config = {
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bersemuka',
      },
      storage: {
        path: process.env.BACKUP_PATH || './backups',
        retention: {
          daily: parseInt(process.env.BACKUP_RETENTION_DAILY || '7'),
          weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || '4'),
          monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || '6'),
        },
      },
      compression: process.env.BACKUP_COMPRESSION === 'true',
      encryption: {
        enabled: process.env.BACKUP_ENCRYPTION === 'true',
        key: process.env.BACKUP_ENCRYPTION_KEY,
      },
    };

    this.backupDir = this.config.storage.path;
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      await fs.mkdir(join(this.backupDir, 'daily'), { recursive: true });
      await fs.mkdir(join(this.backupDir, 'weekly'), { recursive: true });
      await fs.mkdir(join(this.backupDir, 'monthly'), { recursive: true });
    } catch (error) {
      logger.error('Failed to create backup directories:', error);
      throw error;
    }
  }

  /**
   * Create a full database backup
   */
  async createFullBackup(type: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<BackupInfo> {
    const startTime = Date.now();
    const timestamp = new Date();
    const backupId = `${type}_${timestamp.toISOString().replace(/[:.]/g, '-')}`;
    
    logger.info(`Starting ${type} backup: ${backupId}`);

    try {
      // Create backup info
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        type: 'full',
        size: 0,
        checksum: '',
        compressed: this.config.compression,
        encrypted: this.config.encryption.enabled,
        status: 'in_progress',
        duration: 0,
      };

      // Set backup status in cache
      await cacheService.set(`backup:${backupId}`, backupInfo, { ttl: 86400 });

      const backupPath = join(this.backupDir, type, `${backupId}.sql`);
      
      // Create PostgreSQL dump
      await this.createPostgreSQLDump(backupPath);

      // Compress if enabled
      let finalPath = backupPath;
      if (this.config.compression) {
        finalPath = `${backupPath}.gz`;
        await this.compressFile(backupPath, finalPath);
        await fs.unlink(backupPath); // Remove uncompressed file
      }

      // Encrypt if enabled
      if (this.config.encryption.enabled && this.config.encryption.key) {
        const encryptedPath = `${finalPath}.enc`;
        await this.encryptFile(finalPath, encryptedPath);
        await fs.unlink(finalPath); // Remove unencrypted file
        finalPath = encryptedPath;
      }

      // Get file stats
      const stats = await fs.stat(finalPath);
      const checksum = await this.calculateChecksum(finalPath);

      // Update backup info
      backupInfo.size = stats.size;
      backupInfo.checksum = checksum;
      backupInfo.status = 'completed';
      backupInfo.duration = Date.now() - startTime;

      // Save backup metadata
      await this.saveBackupMetadata(backupInfo);
      await cacheService.set(`backup:${backupId}`, backupInfo, { ttl: 86400 });

      logger.info(`Backup completed: ${backupId} (${this.formatBytes(stats.size)}, ${backupInfo.duration}ms)`);

      // Clean up old backups
      await this.cleanupOldBackups(type);

      return backupInfo;
    } catch (error) {
      logger.error(`Backup failed: ${backupId}`, error);
      
      // Update backup status
      const failedInfo: BackupInfo = {
        id: backupId,
        timestamp,
        type: 'full',
        size: 0,
        checksum: '',
        compressed: false,
        encrypted: false,
        status: 'failed',
        duration: Date.now() - startTime,
      };
      
      await cacheService.set(`backup:${backupId}`, failedInfo, { ttl: 86400 });
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupId: string): Promise<boolean> {
    logger.info(`Starting restore from backup: ${backupId}`);

    try {
      // Find backup file
      const backupPath = await this.findBackupFile(backupId);
      if (!backupPath) {
        throw new Error(`Backup file not found: ${backupId}`);
      }

      // Get backup metadata
      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error(`Backup metadata not found: ${backupId}`);
      }

      let workingPath = backupPath;

      // Decrypt if needed
      if (metadata.encrypted) {
        const decryptedPath = workingPath.replace('.enc', '');
        await this.decryptFile(workingPath, decryptedPath);
        workingPath = decryptedPath;
      }

      // Decompress if needed
      if (metadata.compressed) {
        const decompressedPath = workingPath.replace('.gz', '');
        await this.decompressFile(workingPath, decompressedPath);
        workingPath = decompressedPath;
      }

      // Verify checksum
      const currentChecksum = await this.calculateChecksum(backupPath);
      if (currentChecksum !== metadata.checksum) {
        throw new Error('Backup file integrity check failed');
      }

      // Create database restore
      await this.restorePostgreSQLDump(workingPath);

      // Clean up temporary files
      if (workingPath !== backupPath) {
        await fs.unlink(workingPath);
      }

      logger.info(`Restore completed successfully: ${backupId}`);
      return true;
    } catch (error) {
      logger.error(`Restore failed: ${backupId}`, error);
      return false;
    }
  }

  /**
   * Create PostgreSQL dump
   */
  private async createPostgreSQLDump(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h', this.config.database.host,
        '-p', this.config.database.port.toString(),
        '-U', this.config.database.username,
        '-d', this.config.database.database,
        '-f', outputPath,
        '--verbose',
        '--no-owner',
        '--no-privileges',
      ];

      const env = {
        ...process.env,
        PGPASSWORD: this.config.database.password,
      };

      const pgDump = spawn('pg_dump', args, { env });

      let stderr = '';

      pgDump.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pgDump.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pg_dump failed with code ${code}: ${stderr}`));
        }
      });

      pgDump.on('error', reject);
    });
  }

  /**
   * Restore PostgreSQL dump
   */
  private async restorePostgreSQLDump(inputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h', this.config.database.host,
        '-p', this.config.database.port.toString(),
        '-U', this.config.database.username,
        '-d', this.config.database.database,
        '-f', inputPath,
        '--verbose',
      ];

      const env = {
        ...process.env,
        PGPASSWORD: this.config.database.password,
      };

      const psql = spawn('psql', args, { env });

      let stderr = '';

      psql.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      psql.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`psql failed with code ${code}: ${stderr}`));
        }
      });

      psql.on('error', reject);
    });
  }

  /**
   * Compress file using gzip
   */
  private async compressFile(inputPath: string, outputPath: string): Promise<void> {
    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);
    const gzip = createGzip({ level: 6 });

    await pipeline(readStream, gzip, writeStream);
  }

  /**
   * Decompress file using gunzip
   */
  private async decompressFile(inputPath: string, outputPath: string): Promise<void> {
    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);
    const gunzip = createGunzip();

    await pipeline(readStream, gunzip, writeStream);
  }

  /**
   * Encrypt file (simplified - in production use proper encryption)
   */
  private async encryptFile(inputPath: string, outputPath: string): Promise<void> {
    // This is a placeholder - implement proper encryption in production
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(this.config.encryption.key!, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);

    // Write IV to the beginning of the file
    writeStream.write(iv);

    await pipeline(readStream, cipher, writeStream);
  }

  /**
   * Decrypt file
   */
  private async decryptFile(inputPath: string, outputPath: string): Promise<void> {
    // This is a placeholder - implement proper decryption in production
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(this.config.encryption.key!, 'hex');

    const data = await fs.readFile(inputPath);
    const iv = data.slice(0, 16);
    const encryptedData = data.slice(16);

    const decipher = crypto.createDecipher(algorithm, key);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    await fs.writeFile(outputPath, decrypted);
  }

  /**
   * Calculate file checksum
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Find backup file by ID
   */
  private async findBackupFile(backupId: string): Promise<string | null> {
    const types = ['daily', 'weekly', 'monthly'];
    const extensions = ['', '.gz', '.enc'];

    for (const type of types) {
      for (const ext of extensions) {
        const filePath = join(this.backupDir, type, `${backupId}.sql${ext}`);
        try {
          await fs.access(filePath);
          return filePath;
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Save backup metadata
   */
  private async saveBackupMetadata(backupInfo: BackupInfo): Promise<void> {
    const metadataPath = join(this.backupDir, 'metadata.json');
    let metadata: BackupInfo[] = [];

    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(data);
    } catch {
      // File doesn't exist or is corrupted, start fresh
    }

    metadata.push(backupInfo);

    // Keep only recent metadata (last 100 backups)
    if (metadata.length > 100) {
      metadata = metadata.slice(-100);
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Get backup metadata
   */
  private async getBackupMetadata(backupId: string): Promise<BackupInfo | null> {
    try {
      const metadataPath = join(this.backupDir, 'metadata.json');
      const data = await fs.readFile(metadataPath, 'utf8');
      const metadata: BackupInfo[] = JSON.parse(data);
      
      return metadata.find(backup => backup.id === backupId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  private async cleanupOldBackups(type: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      const retention = this.config.storage.retention[type];
      const backupTypeDir = join(this.backupDir, type);
      
      const files = await fs.readdir(backupTypeDir);
      const backupFiles = files.filter(file => file.endsWith('.sql') || file.endsWith('.gz') || file.endsWith('.enc'));
      
      // Sort by creation time (newest first)
      const fileStats = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = join(backupTypeDir, file);
          const stats = await fs.stat(filePath);
          return { file, path: filePath, mtime: stats.mtime };
        })
      );

      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Delete files beyond retention limit
      const filesToDelete = fileStats.slice(retention);
      
      for (const { path, file } of filesToDelete) {
        await fs.unlink(path);
        logger.info(`Deleted old backup: ${file}`);
      }

      if (filesToDelete.length > 0) {
        logger.info(`Cleaned up ${filesToDelete.length} old ${type} backups`);
      }
    } catch (error) {
      logger.error(`Failed to cleanup old ${type} backups:`, error);
    }
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      const metadataPath = join(this.backupDir, 'metadata.json');
      const data = await fs.readFile(metadataPath, 'utf8');
      const metadata: BackupInfo[] = JSON.parse(data);
      
      return metadata.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch {
      return [];
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackup?: Date;
    oldestBackup?: Date;
    failedBackups: number;
  }> {
    const backups = await this.listBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        failedBackups: 0,
      };
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const failedBackups = backups.filter(backup => backup.status === 'failed').length;
    
    return {
      totalBackups: backups.length,
      totalSize,
      lastBackup: backups[0].timestamp,
      oldestBackup: backups[backups.length - 1].timestamp,
      failedBackups,
    };
  }

  /**
   * Test backup integrity
   */
  async testBackupIntegrity(backupId: string): Promise<boolean> {
    try {
      const backupPath = await this.findBackupFile(backupId);
      if (!backupPath) {
        return false;
      }

      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        return false;
      }

      const currentChecksum = await this.calculateChecksum(backupPath);
      return currentChecksum === metadata.checksum;
    } catch {
      return false;
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Schedule automatic backups
   */
  scheduleBackups(): void {
    // Daily backup at 2 AM
    const dailySchedule = '0 2 * * *';
    // Weekly backup on Sunday at 3 AM
    const weeklySchedule = '0 3 * * 0';
    // Monthly backup on 1st day at 4 AM
    const monthlySchedule = '0 4 1 * *';

    // Note: In production, use a proper cron scheduler like node-cron
    logger.info('Backup scheduling initialized');
    logger.info(`Daily backups: ${dailySchedule}`);
    logger.info(`Weekly backups: ${weeklySchedule}`);
    logger.info(`Monthly backups: ${monthlySchedule}`);
  }
}

export const backupService = new BackupService();