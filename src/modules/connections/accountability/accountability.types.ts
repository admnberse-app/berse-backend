import { AccountabilityImpact } from '@prisma/client';

export interface RecordAccountabilityEventInput {
  voucheeId: string;
  impactType: AccountabilityImpact;
  impactValue: number;
  reason: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
}

export interface AccountabilityLogResponse {
  id: string;
  voucherId: string;
  voucheeId: string;
  chainId: string | null;
  impactType: AccountabilityImpact;
  impactValue: number;
  description: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  metadata: any;
  occurredAt: string;
  processedAt: string | null;
  isProcessed: boolean;
  voucher?: {
    id: string;
    fullName: string;
    username: string | null;
    trustScore: number;
  };
  vouchee?: {
    id: string;
    fullName: string;
    username: string | null;
    trustScore: number;
  };
}

export interface AccountabilityImpactSummary {
  totalLogs: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalImpact: number;
  vouchees: Array<{
    voucheeId: string;
    voucheeName: string;
    logCount: number;
    totalImpact: number;
    lastOccurredAt: Date;
  }>;
  recentLogs: Array<{
    id: string;
    voucheeName: string;
    impactType: AccountabilityImpact;
    impactValue: number;
    description: string | null;
    occurredAt: Date;
    isProcessed: boolean;
  }>;
}

export interface AccountabilityHistoryParams {
  page?: number;
  limit?: number;
  impactType?: AccountabilityImpact;
}

export interface AccountabilityHistoryResponse {
  logs: Array<{
    id: string;
    voucherName: string;
    impactType: AccountabilityImpact;
    impactValue: number;
    description: string | null;
    occurredAt: Date;
    isProcessed: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
