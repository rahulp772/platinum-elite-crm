import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';

export interface AuditLogInput {
  userId?: string;
  tenantId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  description?: string;
}

export interface AuditLogQuery {
  userId?: string;
  tenantId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
    private configService: ConfigService,
  ) {}

  private isEnabled(): boolean {
    return this.configService.get('AUDIT_ENABLED') !== 'false';
  }

  async log(input: AuditLogInput): Promise<AuditLog | null> {
    if (!this.isEnabled()) {
      return null;
    }

    const auditLog = this.auditRepository.create(input);
    return this.auditRepository.save(auditLog);
  }

  async logLoginSuccess(user: User, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId: user.id,
      tenantId: user.tenantId,
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      ipAddress,
      userAgent,
      description: `User ${user.email} logged in successfully`,
    });
  }

  async logLoginFailed(
    email: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      action: 'LOGIN_FAILED',
      resource: 'auth',
      ipAddress,
      userAgent,
      metadata: { email, reason },
      description: `Failed login attempt for ${email}${reason ? `: ${reason}` : ''}`,
    });
  }

  async logUserAction(
    user: User,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId: user.id,
      tenantId: user.tenantId,
      action,
      resource,
      resourceId,
      metadata,
      description: `User ${user.email} performed ${action} on ${resource}`,
    });
  }

  async query(query: AuditLogQuery): Promise<{ data: AuditLog[]; total: number }> {
    if (!this.isEnabled()) {
      return { data: [], total: 0 };
    }

    const where: FindOptionsWhere<AuditLog> = {};

    if (query.userId) where.userId = query.userId;
    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.action) where.action = query.action;
    if (query.resource) where.resource = query.resource;

    if (query.startDate && query.endDate) {
      where.createdAt = Between(query.startDate, query.endDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

    const [data, total] = await this.auditRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total };
  }

  async getRetentionDays(): Promise<number> {
    return this.configService.get('AUDIT_RETENTION_DAYS') || 365;
  }

  async deleteOldLogs(): Promise<number> {
    if (!this.isEnabled()) {
      return 0;
    }

    const retentionDays = await this.getRetentionDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}