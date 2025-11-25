/**
 * Base Export Service
 * Abstract class for implementing different export types
 */

import { Response } from 'express';
import ExcelJS from 'exceljs';
import { ExportColumn, ExportOptions, ExportMetadata, StreamExportResult } from './export.types';
import { AppError } from '../../middleware/error';

export abstract class BaseExportService<T = any> {
  protected abstract entityName: string;
  protected abstract defaultFileName: string;
  protected defaultBatchSize = 1000;

  /**
   * Abstract method to define columns for export
   * Must be implemented by subclasses
   */
  protected abstract getColumns(): ExportColumn[];

  /**
   * Abstract method to fetch data in batches
   * Must be implemented by subclasses
   */
  protected abstract fetchBatch(
    skip: number,
    take: number,
    filters?: Record<string, any>
  ): Promise<T[]>;

  /**
   * Abstract method to transform data for export
   * Must be implemented by subclasses
   */
  protected abstract transformRecord(record: T): Record<string, any>;

  /**
   * Optional: Get total count for progress tracking
   */
  protected async getTotalCount(filters?: Record<string, any>): Promise<number> {
    return 0;
  }

  /**
   * Optional: Validate export permissions
   */
  protected async validateExportPermission(userId: string, filters?: Record<string, any>): Promise<boolean> {
    return true;
  }

  /**
   * Optional: Get metadata for export
   */
  protected async getMetadata(filters?: Record<string, any>): Promise<Partial<ExportMetadata>> {
    return {};
  }

  /**
   * Main export method - streams data to response
   */
  async exportToStream(
    res: Response,
    options: ExportOptions,
    userId: string
  ): Promise<StreamExportResult> {
    try {
      // Validate permissions
      const hasPermission = await this.validateExportPermission(userId, options.filters);
      if (!hasPermission) {
        throw new AppError('Unauthorized to export this data', 403);
      }

      // Route to appropriate format handler
      switch (options.format) {
        case 'excel':
          return await this.exportToExcel(res, options);
        case 'csv':
          return await this.exportToCsv(res, options);
        case 'json':
          return await this.exportToJson(res, options);
        default:
          throw new AppError(`Unsupported export format: ${options.format}`, 400);
      }
    } catch (error) {
      console.error(`Export error for ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Export to Excel format with streaming
   */
  protected async exportToExcel(
    res: Response,
    options: ExportOptions
  ): Promise<StreamExportResult> {
    const columns = this.getColumns();
    const batchSize = options.batchSize || this.defaultBatchSize;
    const fileName = options.fileName || `${this.defaultFileName}_${Date.now()}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Create streaming workbook
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const worksheet = workbook.addWorksheet(this.entityName);

    // Add columns
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Stream data in batches
    let skip = 0;
    let totalExported = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await this.fetchBatch(skip, batchSize, options.filters);

      if (batch.length === 0) {
        hasMore = false;
      } else {
        for (const record of batch) {
          const transformedRecord = this.transformRecord(record);
          
          // Apply column formatters if defined
          const formattedRow: any = {};
          columns.forEach(col => {
            const value = transformedRecord[col.key];
            formattedRow[col.key] = col.format ? col.format(value) : value;
          });
          
          worksheet.addRow(formattedRow).commit();
        }

        totalExported += batch.length;
        skip += batchSize;
      }
    }

    // Commit workbook
    await workbook.commit();

    return {
      success: true,
      recordsExported: totalExported,
    };
  }

  /**
   * Export to CSV format with streaming
   */
  protected async exportToCsv(
    res: Response,
    options: ExportOptions
  ): Promise<StreamExportResult> {
    const columns = this.getColumns();
    const batchSize = options.batchSize || this.defaultBatchSize;
    const fileName = options.fileName || `${this.defaultFileName}_${Date.now()}.csv`;

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Helper to escape CSV values
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Write headers
    if (options.includeHeaders !== false) {
      const headerRow = columns.map(col => escapeCsvValue(col.header)).join(',');
      res.write(headerRow + '\n');
    }

    // Stream data in batches
    let skip = 0;
    let totalExported = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await this.fetchBatch(skip, batchSize, options.filters);

      if (batch.length === 0) {
        hasMore = false;
      } else {
        for (const record of batch) {
          const transformed = this.transformRecord(record);
          
          // Apply column formatters and build row
          const rowValues = columns.map(col => {
            const value = transformed[col.key];
            const formatted = col.format ? col.format(value) : value;
            return escapeCsvValue(formatted);
          });
          
          res.write(rowValues.join(',') + '\n');
        }

        totalExported += batch.length;
        skip += batchSize;
      }
    }

    res.end();

    return {
      success: true,
      recordsExported: totalExported,
    };
  }

  /**
   * Export to JSON format
   */
  protected async exportToJson(
    res: Response,
    options: ExportOptions
  ): Promise<StreamExportResult> {
    const batchSize = options.batchSize || this.defaultBatchSize;
    const fileName = options.fileName || `${this.defaultFileName}_${Date.now()}.json`;

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Get metadata
    const metadata = await this.getMetadata(options.filters);
    const totalCount = await this.getTotalCount(options.filters);

    // Start JSON array
    res.write('{\n');
    res.write(`  "metadata": ${JSON.stringify({
      ...metadata,
      totalRecords: totalCount,
      exportedAt: new Date().toISOString(),
      filters: options.filters,
    }, null, 2).replace(/\n/g, '\n  ')},\n`);
    res.write('  "data": [\n');

    // Stream data in batches
    let skip = 0;
    let totalExported = 0;
    let hasMore = true;
    let isFirst = true;

    while (hasMore) {
      const batch = await this.fetchBatch(skip, batchSize, options.filters);

      if (batch.length === 0) {
        hasMore = false;
      } else {
        for (const record of batch) {
          const transformed = this.transformRecord(record);
          
          if (!isFirst) {
            res.write(',\n');
          }
          res.write(`    ${JSON.stringify(transformed)}`);
          isFirst = false;
        }

        totalExported += batch.length;
        skip += batchSize;
      }
    }

    // Close JSON array and object
    res.write('\n  ]\n}\n');
    res.end();

    return {
      success: true,
      recordsExported: totalExported,
    };
  }

  /**
   * Helper: Format date for export
   */
  protected formatDate(date: Date | null | undefined, format: 'date' | 'datetime' | 'time' = 'datetime'): string {
    if (!date) return '';
    
    const d = new Date(date);
    
    switch (format) {
      case 'date':
        return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      case 'time':
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'datetime':
      default:
        return d.toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
    }
  }

  /**
   * Helper: Format boolean for export
   */
  protected formatBoolean(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return '';
    return value ? 'Yes' : 'No';
  }

  /**
   * Helper: Format currency
   */
  protected formatCurrency(amount: number | null | undefined, currency: string = 'MYR'): string {
    if (amount === null || amount === undefined) return '';
    return `${currency} ${amount.toFixed(2)}`;
  }
}
