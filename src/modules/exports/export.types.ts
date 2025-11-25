/**
 * Export Module Types
 */

export type ExportFormat = 'excel' | 'csv' | 'json' | 'pdf';

export type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type ExportEntityType = 
  | 'event_participants'
  | 'users'
  | 'payments'
  | 'communities'
  | 'listings'
  | 'bookings'
  | 'transactions';

export interface ExportOptions {
  format: ExportFormat;
  filters?: Record<string, any>;
  columns?: string[];
  batchSize?: number;
  includeHeaders?: boolean;
  fileName?: string;
}

export interface ExportJob {
  id: string;
  entityType: ExportEntityType;
  entityId?: string;
  format: ExportFormat;
  status: ExportStatus;
  options: ExportOptions;
  progress?: number;
  totalRecords?: number;
  downloadUrl?: string;
  error?: string;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: any) => any;
}

export interface ExportMetadata {
  totalRecords: number;
  exportedAt: Date;
  filters?: Record<string, any>;
  generatedBy?: string;
}

export interface StreamExportResult {
  success: boolean;
  recordsExported: number;
  error?: string;
}
