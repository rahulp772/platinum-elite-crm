import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { LeadActivity, LeadActivityAction } from '../leads/entities/lead-activity.entity';
import { LeadStatus, LeadSource } from '../leads/enums/lead.enum';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

interface PortalPayload {
  name?: string;
  email?: string;
  phone?: string;
  budget?: string | number;
  location?: string;
  propertyType?: string;
  source?: string;
  [key: string]: unknown;
}

@Injectable()
export class PortalWebhooksService {
  private readonly logger = new Logger(PortalWebhooksService.name);

  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(LeadActivity)
    private activityRepository: Repository<LeadActivity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return `+91${digits.slice(1)}`;
    }
    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }
    return `+${digits}`;
  }

  private parseBudget(budget: string | number): { min: number; max: number } {
    if (typeof budget === 'number') {
      return { min: budget, max: budget };
    }
    const budgetStr = budget.toUpperCase().replace(/[,\s]/g, '');
    const lakhMatch = budgetStr.match(/(\d+\.?\d*)\s*L/i);
    const crMatch = budgetStr.match(/(\d+\.?\d*)\s*Cr/i);
    const numMatch = budgetStr.match(/^(\d+)$/);

    if (crMatch) {
      const value = parseFloat(crMatch[1]) * 10000000;
      return { min: value, max: value };
    }
    if (lakhMatch) {
      const value = parseFloat(lakhMatch[1]) * 100000;
      return { min: value, max: value };
    }
    if (numMatch) {
      const value = parseFloat(numMatch[1]);
      return { min: value, max: value };
    }

    return { min: 0, max: 0 };
  }

  private mapPropertyType(propertyType: string): string {
    const typeMap: Record<string, string> = {
      '1rk': '1 BHK',
      '1bhk': '1 BHK',
      '2bhk': '2 BHK',
      '3bhk': '3 BHK',
      '4bhk': '4 BHK',
      '5bhk': '5 BHK',
      'flat': 'Apartment',
      'apartment': 'Apartment',
      'villa': 'Villa',
      'penthouse': 'Penthouse',
      'plot': 'Plot',
      'row house': 'Row House',
    };
    return typeMap[propertyType.toLowerCase()] || propertyType;
  }

  async process99acres(payload: PortalPayload, tenantId: string): Promise<Lead> {
    const phone = this.normalizePhone(payload.phone || '');
    const budget = this.parseBudget(payload.budget || 0);
    const defaultUser = await this.userRepository.findOne({
      where: { tenantId, role: { level: 10 } },
      relations: ['role'],
      order: { createdAt: 'ASC' },
    });

    const lead = this.leadRepository.create({
      name: payload.name || 'Unknown',
      email: payload.email || '',
      phone,
      budgetMin: budget.min,
      budgetMax: budget.max,
      preferredLocation: payload.location,
      propertyType: this.mapPropertyType(payload.propertyType || ''),
      source: LeadSource.ACRES,
      status: LeadStatus.NEW,
      tenantId,
      assignedToId: defaultUser?.id,
    });

    const savedLead = await this.leadRepository.save(lead);

    if (defaultUser) {
      await this.logActivity(savedLead.id, defaultUser.id, LeadActivityAction.CREATED);
    }

    this.logger.log(`99acres lead processed: ${savedLead.id}`);
    return savedLead;
  }

  async processMagicBricks(payload: PortalPayload, tenantId: string): Promise<Lead> {
    const phone = this.normalizePhone(payload.phone || '');
    const budget = this.parseBudget(payload.budget || 0);
    const defaultUser = await this.userRepository.findOne({
      where: { tenantId, role: { level: 10 } },
      relations: ['role'],
      order: { createdAt: 'ASC' },
    });

    const lead = this.leadRepository.create({
      name: payload.name || 'Unknown',
      email: payload.email || '',
      phone,
      budgetMin: budget.min,
      budgetMax: budget.max,
      preferredLocation: payload.location,
      propertyType: this.mapPropertyType(payload.propertyType || ''),
      source: LeadSource.MAGICBRICKS,
      status: LeadStatus.NEW,
      tenantId,
      assignedToId: defaultUser?.id,
    });

    const savedLead = await this.leadRepository.save(lead);

    if (defaultUser) {
      await this.logActivity(savedLead.id, defaultUser.id, LeadActivityAction.CREATED);
    }

    this.logger.log(`MagicBricks lead processed: ${savedLead.id}`);
    return savedLead;
  }

  async processHousing(payload: PortalPayload, tenantId: string): Promise<Lead> {
    const phone = this.normalizePhone(payload.phone || '');
    const budget = this.parseBudget(payload.budget || 0);
    const defaultUser = await this.userRepository.findOne({
      where: { tenantId, role: { level: 10 } },
      relations: ['role'],
      order: { createdAt: 'ASC' },
    });

    const lead = this.leadRepository.create({
      name: payload.name || 'Unknown',
      email: payload.email || '',
      phone,
      budgetMin: budget.min,
      budgetMax: budget.max,
      preferredLocation: payload.location,
      propertyType: this.mapPropertyType(payload.propertyType || ''),
      source: LeadSource.HOUSING,
      status: LeadStatus.NEW,
      tenantId,
      assignedToId: defaultUser?.id,
    });

    const savedLead = await this.leadRepository.save(lead);

    if (defaultUser) {
      await this.logActivity(savedLead.id, defaultUser.id, LeadActivityAction.CREATED);
    }

    this.logger.log(`Housing.com lead processed: ${savedLead.id}`);
    return savedLead;
  }

  private async logActivity(leadId: string, userId: string, action: LeadActivityAction) {
    const activity = this.activityRepository.create({
      leadId,
      userId,
      action,
    });
    await this.activityRepository.save(activity);
  }
}