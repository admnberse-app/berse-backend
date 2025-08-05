import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

interface Secret {
  key: string;
  value: string;
  encrypted: boolean;
  createdAt: Date;
  lastAccessed?: Date;
  metadata?: Record<string, any>;
}

interface SecretsStore {
  version: string;
  secrets: Record<string, Secret>;
  createdAt: Date;
  lastModified: Date;
}

export class SecretsManager {
  private static instance: SecretsManager;
  private masterKey: Buffer | null = null;
  private secretsPath: string;
  private store: SecretsStore | null = null;

  private constructor() {
    this.secretsPath = path.join(process.cwd(), '.secrets', 'store.enc');
  }

  static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  // Initialize master key from environment or generate new one
  async initialize(masterKeyEnv?: string): Promise<void> {
    if (masterKeyEnv) {
      this.masterKey = Buffer.from(masterKeyEnv, 'hex');
    } else {
      // In production, this should be loaded from a secure key management service
      const keyPath = path.join(process.cwd(), '.secrets', 'master.key');
      
      try {
        const keyData = await fs.readFile(keyPath);
        this.masterKey = keyData;
      } catch (error) {
        // Generate new master key if none exists
        this.masterKey = crypto.randomBytes(KEY_LENGTH);
        
        // Ensure .secrets directory exists
        await fs.mkdir(path.dirname(keyPath), { recursive: true });
        
        // Save master key (in production, use a secure key management service)
        await fs.writeFile(keyPath, this.masterKey, { mode: 0o600 });
        
        console.warn('Generated new master key. In production, use a secure key management service.');
      }
    }

    // Load existing secrets store
    await this.loadStore();
  }

  // Derive encryption key from master key and salt
  private deriveKey(salt: Buffer): Buffer {
    if (!this.masterKey) {
      throw new Error('SecretsManager not initialized');
    }
    return crypto.pbkdf2Sync(this.masterKey, salt, 100000, KEY_LENGTH, 'sha512');
  }

  // Encrypt data
  private encrypt(data: string): EncryptedData {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.deriveKey(salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipherGCM(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex'),
    };
  }

  // Decrypt data
  private decrypt(encryptedData: EncryptedData): string {
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const key = this.deriveKey(salt);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipherGCM(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Load secrets store from disk
  private async loadStore(): Promise<void> {
    try {
      const encryptedStore = await fs.readFile(this.secretsPath, 'utf8');
      const encryptedData: EncryptedData = JSON.parse(encryptedStore);
      const decryptedStore = this.decrypt(encryptedData);
      this.store = JSON.parse(decryptedStore);
    } catch (error) {
      // Initialize empty store if none exists
      this.store = {
        version: '1.0.0',
        secrets: {},
        createdAt: new Date(),
        lastModified: new Date(),
      };
    }
  }

  // Save secrets store to disk
  private async saveStore(): Promise<void> {
    if (!this.store) {
      throw new Error('No store to save');
    }

    this.store.lastModified = new Date();
    const storeData = JSON.stringify(this.store);
    const encryptedData = this.encrypt(storeData);
    
    // Ensure .secrets directory exists
    await fs.mkdir(path.dirname(this.secretsPath), { recursive: true });
    
    await fs.writeFile(this.secretsPath, JSON.stringify(encryptedData), { mode: 0o600 });
  }

  // Set a secret
  async setSecret(key: string, value: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.store) {
      throw new Error('SecretsManager not initialized');
    }

    // Validate key format
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
      throw new Error('Secret key must be uppercase with underscores only');
    }

    this.store.secrets[key] = {
      key,
      value,
      encrypted: true,
      createdAt: new Date(),
      metadata,
    };

    await this.saveStore();
  }

  // Get a secret
  async getSecret(key: string): Promise<string | null> {
    if (!this.store) {
      throw new Error('SecretsManager not initialized');
    }

    const secret = this.store.secrets[key];
    if (!secret) {
      return null;
    }

    // Update last accessed time
    secret.lastAccessed = new Date();
    await this.saveStore();

    return secret.value;
  }

  // Get secret with fallback to environment variable
  async getSecretOrEnv(key: string): Promise<string | null> {
    const secret = await this.getSecret(key);
    if (secret !== null) {
      return secret;
    }

    // Fallback to environment variable
    return process.env[key] || null;
  }

  // List all secret keys
  async listSecrets(): Promise<string[]> {
    if (!this.store) {
      throw new Error('SecretsManager not initialized');
    }

    return Object.keys(this.store.secrets);
  }

  // Delete a secret
  async deleteSecret(key: string): Promise<boolean> {
    if (!this.store) {
      throw new Error('SecretsManager not initialized');
    }

    if (this.store.secrets[key]) {
      delete this.store.secrets[key];
      await this.saveStore();
      return true;
    }

    return false;
  }

  // Rotate a secret (useful for API keys)
  async rotateSecret(key: string, newValue: string): Promise<void> {
    const oldSecret = await this.getSecret(key);
    if (!oldSecret) {
      throw new Error(`Secret ${key} not found`);
    }

    await this.setSecret(key, newValue, { 
      rotatedAt: new Date(),
      previousValue: oldSecret.substring(0, 4) + '***' // Log partial old value for audit
    });
  }

  // Get secret metadata
  async getSecretMetadata(key: string): Promise<Record<string, any> | null> {
    if (!this.store) {
      throw new Error('SecretsManager not initialized');
    }

    const secret = this.store.secrets[key];
    return secret ? {
      createdAt: secret.createdAt,
      lastAccessed: secret.lastAccessed,
      metadata: secret.metadata,
    } : null;
  }

  // Import secrets from environment variables
  async importFromEnv(keys: string[]): Promise<void> {
    for (const key of keys) {
      const value = process.env[key];
      if (value) {
        await this.setSecret(key, value, { importedFromEnv: true });
      }
    }
  }

  // Export secrets to environment format (for deployment)
  async exportToEnv(): Promise<string> {
    if (!this.store) {
      throw new Error('SecretsManager not initialized');
    }

    const envLines: string[] = [];
    for (const [key, secret] of Object.entries(this.store.secrets)) {
      envLines.push(`${key}="${secret.value}"`);
    }

    return envLines.join('\n');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; secretCount: number; lastModified: Date }> {
    if (!this.store) {
      return { status: 'not_initialized', secretCount: 0, lastModified: new Date() };
    }

    return {
      status: 'healthy',
      secretCount: Object.keys(this.store.secrets).length,
      lastModified: this.store.lastModified,
    };
  }
}

// Helper function for safe secret access
export async function getSecret(key: string, fallbackEnv = true): Promise<string | null> {
  const secretsManager = SecretsManager.getInstance();
  
  try {
    if (fallbackEnv) {
      return await secretsManager.getSecretOrEnv(key);
    } else {
      return await secretsManager.getSecret(key);
    }
  } catch (error) {
    console.error(`Failed to get secret ${key}:`, error);
    return fallbackEnv ? process.env[key] || null : null;
  }
}

// Initialize secrets manager
export async function initializeSecretsManager(): Promise<void> {
  const secretsManager = SecretsManager.getInstance();
  const masterKey = process.env.SECRETS_MASTER_KEY;
  
  try {
    await secretsManager.initialize(masterKey);
    
    // Import critical secrets from environment if they don't exist
    const criticalSecrets = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'DATABASE_URL',
      'COOKIE_SECRET',
    ];
    
    await secretsManager.importFromEnv(criticalSecrets);
    
    console.log('Secrets manager initialized successfully');
  } catch (error) {
    console.error('Failed to initialize secrets manager:', error);
    
    if (config.isProduction) {
      throw error; // Fail fast in production
    }
  }
}

export default SecretsManager;