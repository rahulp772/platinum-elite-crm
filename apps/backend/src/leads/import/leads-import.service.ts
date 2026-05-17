import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import * as XLSX from 'xlsx';
import { Lead } from '../entities/lead.entity';
import { User } from '../../users/entities/user.entity';
import {
  ImportSession,
  ImportStatus,
  DuplicateStrategy,
  ImportProgress,
} from './entities/import-session.entity';
import { StorageService } from '../../common/storage.service';
import { ConfigService } from '@nestjs/config';

interface ImportBatchJobData {
  sessionId: string;
  batchIndex: number;
  batchData: Record<string, unknown>[];
  mapping: Record<string, string>;
  tenantId: string;
}

interface ValidationResult {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  sampleErrors: SampleError[];
}

interface SampleError {
  row: number;
  field: string;
  message: string;
}

@Injectable()
export class LeadsImportService {
  private readonly logger = new Logger(LeadsImportService.name);
  private readonly batchSize: number;

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(ImportSession)
    private readonly importSessionRepo: Repository<ImportSession>,
    @InjectQueue('leads-import')
    private readonly importQueue: Queue<ImportBatchJobData>,
    private readonly storageService: StorageService,
    configService: ConfigService,
  ) {
    this.batchSize = configService.get<number>('IMPORT_BATCH_SIZE', 500);
  }

  async getTemplate(): Promise<Buffer> {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'WhatsApp Number',
      'Status',
      'Source',
      'Budget Min',
      'Budget Max',
      'Preferred Location',
      'Property Type',
      'Bedroom',
      'Tier',
      'Notes',
    ];

    const sampleData = [
      {
        Name: 'John Doe',
        Email: 'john@example.com',
        Phone: '9876543210',
        'WhatsApp Number': '9876543210',
        Status: 'new',
        Source: 'website',
        'Budget Min': 5000000,
        'Budget Max': 10000000,
        'Preferred Location': 'Mumbai',
        'Property Type': '2 BHK',
        Bedroom: 2,
        Tier: 'medium',
        Notes: 'Looking for a sea-facing apartment.',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Template');

    // Write to buffer
    const xlsxBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
    return Buffer.from(xlsxBuffer);
  }

  async uploadFile(
    file: Express.Multer.File,
    user: User,
  ): Promise<{ sessionId: string; s3Key: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const { key } = await this.storageService.saveFile(file);

    const session = this.importSessionRepo.create({
      tenantId: user.tenantId,
      userId: user.id,
      originalFileName: file.originalname,
      s3Key: key,
      status: ImportStatus.PENDING,
      batchSize: this.batchSize,
    });

    await this.importSessionRepo.save(session);

    this.logger.log(
      `Import session created: ${session.id} for file: ${file.originalname}`,
    );

    return { sessionId: session.id, s3Key: key };
  }

  async parseFile(sessionId: string): Promise<{
    headers: string[];
    preview: unknown[][];
    totalRows: number;
  }> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Import session not found');
    }

    const rawData = await this.storageService.readFile(session.s3Key);

    if (rawData.length === 0) {
      throw new BadRequestException('File is empty');
    }

    const headers = rawData[0] as string[];
    const data = rawData.slice(1);
    const preview = data.slice(0, 10);

    session.totalRows = data.length;
    session.totalBatches = Math.ceil(data.length / this.batchSize);
    await this.importSessionRepo.save(session);

    return {
      headers,
      preview,
      totalRows: data.length,
    };
  }

  async validateSample(
    sessionId: string,
    mapping: Record<string, string>,
  ): Promise<ValidationResult> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Import session not found');
    }

    session.status = ImportStatus.VALIDATING;
    await this.importSessionRepo.save(session);

    const rawData = await this.storageService.readFile(session.s3Key);

    if (rawData.length < 2) {
      session.status = ImportStatus.PENDING;
      await this.importSessionRepo.save(session);
      return {
        validCount: 0,
        invalidCount: 0,
        duplicateCount: 0,
        sampleErrors: [],
      };
    }

    const headers = rawData[0] as string[];
    const data = rawData.slice(1);

    // Create column index map from mapping
    const columnIndexes: Record<string, number> = {};
    for (const [systemField, fileColumn] of Object.entries(mapping)) {
      if (fileColumn && fileColumn !== 'unmapped') {
        const index = headers.indexOf(fileColumn);
        if (index >= 0) {
          columnIndexes[systemField] = index;
        }
      }
    }

    const result: ValidationResult = {
      validCount: 0,
      invalidCount: 0,
      duplicateCount: 0,
      sampleErrors: [],
    };

    const nameColumn = columnIndexes.name;
    const phoneColumn = columnIndexes.phone;

    if (nameColumn === undefined || phoneColumn === undefined) {
      result.invalidCount = data.length;
      result.sampleErrors.push({
        row: 0,
        field: 'required',
        message: 'Name or Phone mapping is required',
      });
      session.status = ImportStatus.PENDING;
      await this.importSessionRepo.save(session);
      return result;
    }

    // Validate ALL rows
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowIndex = i + 1;

      const nameValue = row[nameColumn];
      const phoneValue = row[phoneColumn];

      if (!nameValue || !phoneValue) {
        result.invalidCount++;
        if (result.sampleErrors.length < 20) {
          result.sampleErrors.push({
            row: rowIndex,
            field: 'name/phone',
            message: 'Missing required fields',
          });
        }
        continue;
      }

      const phoneStr = String(phoneValue).replace(/\D/g, '');
      const existingLead = await this.leadRepository.findOne({
        where: { phone: phoneStr, tenantId: session.tenantId },
      });

      if (existingLead) {
        result.duplicateCount++;
      } else {
        result.validCount++;
      }
    }

    session.status = ImportStatus.PENDING;
    await this.importSessionRepo.save(session);

    return result;
  }

  async startImport(
    sessionId: string,
    mapping: Record<string, string>,
    duplicateStrategy: DuplicateStrategy,
  ): Promise<{ message: string }> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Import session not found');
    }

    const rawData = await this.storageService.readFile(session.s3Key);

    if (rawData.length < 2) {
      throw new BadRequestException('No data to import');
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    // Convert flat arrays to keyed objects using column indexes
    const columnIndexes: Record<string, number> = {};
    for (const [systemField, fileColumn] of Object.entries(mapping)) {
      if (fileColumn && fileColumn !== 'unmapped') {
        const index = headers.indexOf(fileColumn);
        if (index >= 0) {
          columnIndexes[systemField] = index;
        }
      }
    }

    const data = dataRows.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      for (const [systemField, colIndex] of Object.entries(columnIndexes)) {
        obj[systemField] = row[colIndex];
      }
      return obj;
    });

    session.mapping = mapping;
    session.duplicateStrategy = duplicateStrategy;
    session.totalRows = data.length;
    session.totalBatches = Math.ceil(data.length / session.batchSize);
    session.status = ImportStatus.QUEUED;
    session.startedAt = new Date();
    session.errors = [];
    session.processedRows = 0;
    session.successCount = 0;
    session.errorCount = 0;
    session.currentBatch = 0;
    await this.importSessionRepo.save(session);

    for (let i = 0; i < session.totalBatches; i++) {
      const start = i * session.batchSize;
      const end = Math.min(start + session.batchSize, data.length);
      const batchData = data.slice(start, end);

      const jobData: ImportBatchJobData = {
        sessionId,
        batchIndex: i,
        batchData,
        mapping,
        tenantId: session.tenantId || '',
      };

      await this.importQueue.add('process-batch', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    }

    this.logger.log(
      `Started import for session ${sessionId}: ${session.totalBatches} batches queued`,
    );

    return {
      message: `Import started. ${session.totalBatches} batches queued for processing.`,
    };
  }

  async getStatus(sessionId: string): Promise<ImportProgress> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Import session not found');
    }

    const progress: ImportProgress = {
      id: session.id,
      status: session.status,
      totalRows: session.totalRows,
      processedRows: session.processedRows,
      successCount: session.successCount,
      errorCount: session.errorCount,
      currentBatch: session.currentBatch,
      totalBatches: session.totalBatches,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      errors: session.errors,
    };

    if (session.status === ImportStatus.PROCESSING && session.startedAt) {
      const elapsed = Date.now() - new Date(session.startedAt).getTime();
      const rowsPerMs = session.processedRows / elapsed;
      const remainingRows = session.totalRows - session.processedRows;
      progress.estimatedTimeRemaining = Math.round(
        remainingRows / rowsPerMs / 1000,
      );
    }

    return progress;
  }

  async cancelImport(sessionId: string): Promise<{ message: string }> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Import session not found');
    }

    if (
      session.status === ImportStatus.COMPLETED ||
      session.status === ImportStatus.FAILED
    ) {
      throw new BadRequestException(
        'Cannot cancel a completed or failed import',
      );
    }

    session.status = ImportStatus.CANCELLED;
    session.completedAt = new Date();
    await this.importSessionRepo.save(session);

    const jobs = await this.importQueue.getJobs([
      'waiting',
      'delayed',
      'active',
    ]);
    for (const job of jobs) {
      if (job.data.sessionId === sessionId) {
        await job.remove();
      }
    }

    this.logger.log(`Import session ${sessionId} cancelled`);

    return { message: 'Import cancelled' };
  }

  async generateErrorReport(sessionId: string): Promise<Buffer> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Import session not found');
    }

    const errors = session.errors || [];
    if (errors.length === 0) {
      const csvContent = 'Row,Field,Message\n1,-,No errors found';
      return Buffer.from(csvContent);
    }

    const csvData = errors.map((err) => ({
      'Row Number': err.row,
      Field: err.field || '-',
      'Error Message': err.message,
      'Original Value': err.originalValue || '-',
    }));

    // Create CSV manually for better compatibility
    const headers = ['Row Number', 'Field', 'Error Message', 'Original Value'];
    const csvRows = [
      headers.join(','),
      ...csvData.map((row) =>
        [
          row['Row Number'],
          `"${(row.Field || '').replace(/"/g, '""')}"`,
          `"${(row['Error Message'] || '').replace(/"/g, '""')}"`,
          `"${(row['Original Value'] || '').replace(/"/g, '""')}"`,
        ].join(','),
      ),
    ];

    return Buffer.from(csvRows.join('\n'));
  }

  async deleteSessionFile(sessionId: string): Promise<void> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session || !session.s3Key) return;

    try {
      await this.storageService.deleteFile(session.s3Key);
    } catch (error) {
      const err = error as Error;
      this.logger.warn(
        `Failed to delete file for session ${sessionId}: ${err.message}`,
      );
    }
  }
}
