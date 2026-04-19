import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';
import { DealStage } from '../deals/enums/deal.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
  ) {}

  async getDashboardStats() {
    const totalProperties = await this.propertyRepository.count();
    const totalLeads = await this.leadRepository.count();
    const totalDeals = await this.dealRepository.count();
    
    const dealsByStage = await this.dealRepository
      .createQueryBuilder('deal')
      .select('deal.stage', 'stage')
      .addSelect('COUNT(deal.id)', 'count')
      .groupBy('deal.stage')
      .getRawMany();

    const revenue = await this.dealRepository
      .createQueryBuilder('deal')
      .select('SUM(deal.value)', 'total')
      .where('deal.stage = :stage', { stage: 'closed' })
      .getRawOne();

    return {
      overview: {
        totalProperties,
        totalLeads,
        totalDeals,
        totalRevenue: parseFloat(revenue?.total || '0'),
      },
      dealsByStage,
    };
  }

  async getLeadStats() {
    return this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(lead.id)', 'count')
      .groupBy('lead.status')
      .getRawMany();
  }

  async getPropertyStats() {
    return this.propertyRepository
      .createQueryBuilder('property')
      .select('property.status', 'status')
      .addSelect('COUNT(property.id)', 'count')
      .groupBy('property.status')
      .getRawMany();
  }
}
