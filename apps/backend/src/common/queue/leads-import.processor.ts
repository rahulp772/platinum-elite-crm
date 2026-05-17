import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ImportSession,
  ImportStatus,
  DuplicateStrategy,
  ImportError,
} from '../../leads/import/entities/import-session.entity';
import { Lead, UpdateLeadInput } from '../../leads/entities/lead.entity';
import { LeadStatus, LeadSource, LeadTier } from '../../leads/enums/lead.enum';

export interface ImportBatchJobData {
  sessionId: string;
  batchIndex: number;
  batchData: Record<string, unknown>[];
  mapping: Record<string, string>;
  tenantId: string;
}

interface BatchResult {
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ImportError[];
}

@Processor('leads-import')
export class LeadsImportProcessor extends WorkerHost {
  private readonly logger = new Logger(LeadsImportProcessor.name);

  constructor(
    @InjectRepository(ImportSession)
    private readonly importSessionRepo: Repository<ImportSession>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {
    super();
  }

  async process(job: Job<ImportBatchJobData>): Promise<BatchResult> {
    const { sessionId, batchIndex, batchData, tenantId } = job.data;

    this.logger.log(
      `Processing batch ${batchIndex} for session ${sessionId} (${batchData.length} rows)`,
    );

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors: ImportError[] = [];

    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session || session.status === ImportStatus.CANCELLED) {
      this.logger.log(
        `Session ${sessionId} was cancelled, stopping processing`,
      );
      return { successCount: 0, errorCount: 0, skippedCount: 0, errors: [] };
    }

    const batchSize = session.batchSize || 500;

    for (let i = 0; i < batchData.length; i++) {
      const row = batchData[i];
      const rowIndex = batchIndex * batchSize + i;

      try {
        // Data is already keyed by systemField names (name, phone, etc.)
        const nameValue = String(row.name || '').trim();
        const phoneValue = String(row.phone || '').replace(/\D/g, '');

        if (!nameValue || !phoneValue) {
          errorCount++;
          errors.push({
            row: rowIndex + 1,
            field: 'name/phone',
            message: 'Missing required fields (Name or Phone)',
            originalValue: JSON.stringify(row).substring(0, 200),
          });
          continue;
        }

        const existingLead = await this.leadRepository.findOne({
          where: { phone: phoneValue, tenantId },
        });

        // Helper to get value from row with type conversion
        const getValue = (field: string): unknown => row[field];
        const getString = (field: string, defaultVal = ''): string => {
          const val = row[field];
          return val ? String(val) : defaultVal;
        };
        const getNumber = (field: string, defaultVal = 0): number => {
          const val = row[field];
          return val ? Number(val) || defaultVal : defaultVal;
        };

        if (existingLead) {
          switch (session.duplicateStrategy) {
            case DuplicateStrategy.SKIP: {
              skippedCount++;
              break;
            }
            case DuplicateStrategy.UPDATE: {
              const updateData: UpdateLeadInput = {
                name: nameValue,
              };
              const email = getString('email');
              if (email) updateData.email = email;
              const whatsapp = getString('whatsappNumber');
              if (whatsapp) updateData.whatsappNumber = whatsapp;
              const source = getString('source');
              if (source) updateData.source = source as LeadSource;
              const budgetMin = getNumber('budgetMin');
              if (budgetMin) updateData.budgetMin = budgetMin;
              const budgetMax = getNumber('budgetMax');
              if (budgetMax) updateData.budgetMax = budgetMax;
              const location = getString('preferredLocation');
              if (location) updateData.preferredLocation = location;
              const propType = getString('propertyType');
              if (propType) updateData.propertyType = propType;
              const notes = getString('notes');
              if (notes) updateData.notes = notes;

              await this.leadRepository.update(existingLead.id, updateData);
              successCount++;
              break;
            }
            case DuplicateStrategy.DUPLICATE: {
              const newLead = new Lead();
              newLead.tenantId = tenantId;
              newLead.name = nameValue;
              newLead.email = getString('email');
              newLead.phone = phoneValue;
              newLead.whatsappNumber = getString('whatsappNumber');
              newLead.status = this.parseStatus(getString('status', 'new'));
              newLead.source =
                (getString('source') as LeadSource) || LeadSource.WEBSITE;
              newLead.budgetMin = getNumber('budgetMin');
              newLead.budgetMax = getNumber('budgetMax');
              newLead.preferredLocation = getString('preferredLocation');
              newLead.propertyType = getString('propertyType');
              newLead.bedroom = getNumber('bedroom');
              newLead.tier = (getString('tier') as LeadTier) || LeadTier.MEDIUM;
              newLead.notes = getString('notes');
              await this.leadRepository.save(newLead);
              successCount++;
              break;
            }
          }
        } else {
          const newLead = new Lead();
          newLead.tenantId = tenantId;
          newLead.name = nameValue;
          newLead.email = getString('email');
          newLead.phone = phoneValue;
          newLead.whatsappNumber = getString('whatsappNumber');
          newLead.status = this.parseStatus(getString('status', 'new'));
          newLead.source =
            (getString('source') as LeadSource) || LeadSource.WEBSITE;
          newLead.budgetMin = getNumber('budgetMin');
          newLead.budgetMax = getNumber('budgetMax');
          newLead.preferredLocation = getString('preferredLocation');
          newLead.propertyType = getString('propertyType');
          newLead.bedroom = getNumber('bedroom');
          newLead.tier = (getString('tier') as LeadTier) || LeadTier.MEDIUM;
          newLead.notes = getString('notes');
          await this.leadRepository.save(newLead);
          successCount++;
        }
      } catch (err: unknown) {
        errorCount++;
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        errors.push({
          row: rowIndex + 1,
          field: 'general',
          message: errorMessage,
          originalValue: JSON.stringify(row).substring(0, 200),
        });
      }
    }

    await this.updateSessionProgress(
      sessionId,
      batchData.length,
      successCount,
      errorCount,
      skippedCount,
      errors,
    );

    this.logger.log(
      `Batch ${batchIndex} completed: ${successCount} success, ${errorCount} errors, ${skippedCount} skipped`,
    );

    return { successCount, errorCount, skippedCount, errors };
  }

  private parseStatus(status: string): LeadStatus {
    const validStatuses = Object.values(LeadStatus);
    const lowerStatus = status?.toLowerCase();
    return validStatuses.includes(lowerStatus as LeadStatus)
      ? (lowerStatus as LeadStatus)
      : LeadStatus.NEW;
  }

  private async updateSessionProgress(
    sessionId: string,
    processedRows: number,
    successCount: number,
    errorCount: number,
    _skippedCount: number,
    batchErrors: ImportError[],
  ): Promise<void> {
    const session = await this.importSessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) return;

    session.processedRows += processedRows;
    session.successCount += successCount;
    session.errorCount += errorCount;
    session.currentBatch += 1;

    const existingErrors = Array.isArray(session.errors) ? session.errors : [];
    session.errors = [...existingErrors, ...batchErrors].slice(-1000);

    if (session.currentBatch >= session.totalBatches) {
      session.status = ImportStatus.COMPLETED;
      session.completedAt = new Date();
    } else {
      session.status = ImportStatus.PROCESSING;
    }

    await this.importSessionRepo.save(session);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ImportBatchJobData>): void {
    this.logger.log(
      `Job ${job.id} completed for session ${job.data.sessionId}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ImportBatchJobData>, error: Error): void {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
