import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  private getRoleLevel(user: User): number {
    if (user.isSuperAdmin) return 200;
    return user.role?.level || 0;
  }

  private applyHierarchyFilters<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    user: User,
    roleLevel: number,
    userIdField: string,
  ) {
    if (user.isSuperAdmin) return query;

    query.andWhere(`${query.alias}.tenantId = :tenantId`, { tenantId: user.tenantId });

    if (roleLevel < 100) {
      if (roleLevel <= 50) {
        query.andWhere(`${query.alias}.${userIdField} = :userId`, { userId: user.id });
      }
    }

    return query;
  }

  async getDashboardStats(user: User) {
    const roleLevel = this.getRoleLevel(user);
    
    const propQuery = this.propertyRepository.createQueryBuilder('property');
    const leadQuery = this.leadRepository.createQueryBuilder('lead');
    const dealQuery = this.dealRepository.createQueryBuilder('deal');

    this.applyHierarchyFilters(propQuery, user, roleLevel, 'agentId');
    this.applyHierarchyFilters(leadQuery, user, roleLevel, 'assignedToId');
    this.applyHierarchyFilters(dealQuery, user, roleLevel, 'agentId');

    const totalProperties = await propQuery.getCount();
    const totalLeads = await leadQuery.getCount();
    const totalDeals = await dealQuery.getCount();

    const dealsByStage = await dealQuery
      .select('deal.stage', 'stage')
      .addSelect('COUNT(deal.id)', 'count')
      .groupBy('deal.stage')
      .getRawMany();

    const revenueQuery = this.dealRepository.createQueryBuilder('deal');
    this.applyHierarchyFilters(revenueQuery, user, roleLevel, 'agentId');
    const revenue = await revenueQuery
      .select('SUM(deal.value)', 'total')
      .andWhere('deal.stage = :stage', { stage: 'closed' })
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

  async getLeadStats(user: User) {
    const roleLevel = this.getRoleLevel(user);
    const query = this.leadRepository.createQueryBuilder('lead');
    this.applyHierarchyFilters(query, user, roleLevel, 'assignedToId');

    return query
      .select('lead.status', 'status')
      .addSelect('COUNT(lead.id)', 'count')
      .groupBy('lead.status')
      .getRawMany();
  }

  async getPropertyStats(user: User) {
    const roleLevel = this.getRoleLevel(user);
    const query = this.propertyRepository.createQueryBuilder('property');
    this.applyHierarchyFilters(query, user, roleLevel, 'agentId');

    return query
      .select('property.status', 'status')
      .addSelect('COUNT(property.id)', 'count')
      .groupBy('property.status')
      .getRawMany();
  }
}

