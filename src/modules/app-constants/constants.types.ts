/**
 * App Constants Types
 * Centralized type definitions for enums and constants used across the application
 */

export interface EnumValue {
  key: string;
  value: string;
  label: string;
  description?: string;
}

export interface EnumCategory {
  category: string;
  description: string;
  values: EnumValue[];
}

export interface AppConstantsResponse {
  version: string;
  lastUpdated: string;
  enums: {
    [key: string]: EnumCategory;
  };
}

export interface ValidationRulesResponse {
  version: string;
  rules: {
    [key: string]: ValidationRule;
  };
}

export interface ValidationRule {
  field: string;
  type: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
  description: string;
}

export interface AppConfigResponse {
  version: string;
  features: {
    [key: string]: FeatureConfig;
  };
  limits: {
    [key: string]: LimitConfig;
  };
  settings: {
    [key: string]: SettingConfig;
  };
}

export interface FeatureConfig {
  enabled: boolean;
  description: string;
  metadata?: Record<string, any>;
}

export interface LimitConfig {
  value: number;
  description: string;
  unit?: string;
}

export interface SettingConfig {
  value: any;
  type: string;
  description: string;
  options?: any[];
}
