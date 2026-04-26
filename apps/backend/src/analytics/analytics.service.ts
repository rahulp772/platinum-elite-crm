import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, ObjectLiteral, MoreThanOrEqual } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Task } from '../tasks/entities/task.entity';
import { LeadActivity } from '../leads/entities/lead-activity.entity';

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
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(LeadActivity)
    private leadActivityRepository: Repository<LeadActivity>,
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

  async getLeadFunnelStats(user: User) {
    const roleLevel = this.getRoleLevel(user);
    const query = this.leadRepository.createQueryBuilder('lead');
    this.applyHierarchyFilters(query, user, roleLevel, 'assignedToId');

    const stats = await query
      .select('lead.status', 'status')
      .addSelect('COUNT(lead.id)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    const grouping = {
      Discovery: ['new'],
      Engagement: ['contacted', 'rnr'],
      Qualification: ['qualified', 'interested'],
      Negotiation: ['site_visit_scheduled', 'site_visit_done', 'negotiation'],
      Conversion: ['booked'],
    };

    const funnel = Object.entries(grouping).map(([stage, statuses]) => {
      const count = stats
        .filter((s) => statuses.includes(s.status))
        .reduce((sum, s) => sum + parseInt(s.count), 0);
      return { stage, count };
    });

    return funnel;
  }

  async getLeadResponseTime(user: User) {
    const roleLevel = this.getRoleLevel(user);
    
    const leadQuery = this.leadRepository.createQueryBuilder('lead');
    this.applyHierarchyFilters(leadQuery, user, roleLevel, 'assignedToId');
    
    const leads = await leadQuery.select(['lead.id', 'lead.createdAt']).getRawMany();
    const totalLeads = leads.length;
    
    if (totalLeads === 0) {
      return {
        averageMinutes: 0,
        leadsContacted: 0,
        totalLeads: 0,
        trend: 0,
        byHour: []
      };
    }

    const leadIds = leads.map(l => l.lead_id);
    const activities = await this.leadActivityRepository
      .createQueryBuilder('activity')
      .where('activity.leadId IN (:...leadIds)', { leadIds })
      .andWhere("activity.action IN ('status_changed', 'note_added', 'followup_scheduled')")
      .orderBy('activity.timestamp', 'ASC')
      .getMany();

    const responseTimes: number[] = [];
    const leadFirstContact: Map<string, Date> = new Map();

    for (const activity of activities) {
      if (!leadFirstContact.has(activity.leadId)) {
        const lead = leads.find(l => l.lead_id === activity.leadId);
        if (lead) {
          const createdAt = new Date(lead.lead_createdAt);
          const responseTime = (activity.timestamp.getTime() - createdAt.getTime()) / (1000 * 60);
          responseTimes.push(responseTime);
          leadFirstContact.set(activity.leadId, activity.timestamp);
        }
      }
    }

    const leadsContacted = leadFirstContact.size;
    const averageMinutes = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    const hourDistribution: { hours: number; count: number }[] = [];
    for (let h = 0; h <= 24; h++) {
      const count = responseTimes.filter(t => t >= h * 60 && t < (h + 1) * 60).length;
      hourDistribution.push({ hours: h, count });
    }

    return {
      averageMinutes: Math.round(averageMinutes),
      leadsContacted,
      totalLeads,
      trend: 0,
      byHour: hourDistribution
    };
  }

  async getPipelineValue(user: User) {
    const roleLevel = this.getRoleLevel(user);
    const dealQuery = this.dealRepository.createQueryBuilder('deal');
    this.applyHierarchyFilters(dealQuery, user, roleLevel, 'agentId');
    
    const deals = await dealQuery
      .select(['deal.id', 'deal.value', 'deal.stage'])
      .getRawMany();

    const stageWeights: Record<string, number> = {
      lead: 0.1,
      negotiation: 0.6,
      under_contract: 0.8,
      closed: 1.0
    };

    const byStage: Record<string, { value: number; count: number }> = {};
    let rawValue = 0;
    let weightedValue = 0;

    for (const deal of deals) {
      const value = parseFloat(deal.deal_value) || 0;
      const stage = deal.deal_stage || 'lead';
      const weight = stageWeights[stage] || 0.1;
      
      rawValue += value;
      weightedValue += value * weight;

      if (!byStage[stage]) {
        byStage[stage] = { value: 0, count: 0 };
      }
      byStage[stage].value += value;
      byStage[stage].count += 1;
    }

    const avgDealSize = deals.length > 0 ? rawValue / deals.length : 0;

    const byStageArray = Object.entries(byStage).map(([stage, data]) => ({
      stage,
      value: data.value,
      count: data.count,
      probability: stageWeights[stage] * 100
    }));

    return {
      rawValue,
      weightedValue: Math.round(weightedValue),
      dealCount: deals.length,
      avgDealSize: Math.round(avgDealSize),
      trend: 0,
      byStage: byStageArray
    };
  }

  async getTeamPerformance(user: User) {
    const roleLevel = this.getRoleLevel(user);
    
    const usersQuery = this.userRepository.createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('user.tenantId = :tenantId', { tenantId: user.tenantId });
    
    if (roleLevel < 100) {
      usersQuery.andWhere('user.id = :userId', { userId: user.id });
    }

    const teamMembers = await usersQuery
      .select(['user.id', 'user.name', 'user.email'])
      .getRawMany();

    const agents: { id: string; name: string; email: string; dealsCount: number; revenue: number; conversionRate: number }[] = [];

    for (const member of teamMembers) {
      const dealsQuery = this.dealRepository.createQueryBuilder('deal')
        .where('deal.agentId = :agentId', { agentId: member.user_id })
        .andWhere('deal.tenantId = :tenantId', { tenantId: user.tenantId });

      const deals = await dealsQuery
        .select(['deal.id', 'deal.value', 'deal.stage'])
        .getRawMany();

      const closedDeals = deals.filter(d => d.deal_stage === 'closed');
      const totalRevenue = closedDeals.reduce((sum, d) => sum + (parseFloat(d.deal_value) || 0), 0);
      const conversionRate = deals.length > 0 ? (closedDeals.length / deals.length) * 100 : 0;

      agents.push({
        id: member.user_id,
        name: member.user_name || member.user_email,
        email: member.user_email,
        dealsCount: closedDeals.length,
        revenue: Math.round(totalRevenue),
        conversionRate: Math.round(conversionRate)
      });
    }

    return agents.sort((a, b) => b.revenue - a.revenue);
  }

  async getRevenueTrend(user: User) {
    const roleLevel = this.getRoleLevel(user);
    const dealQuery = this.dealRepository.createQueryBuilder('deal');
    this.applyHierarchyFilters(dealQuery, user, roleLevel, 'agentId');
    
    const deals = await dealQuery
      .select(['deal.value', 'deal.stage', 'deal.createdAt'])
      .andWhere('deal.stage = :stage', { stage: 'closed' })
      .getRawMany();

    const monthlyRevenue: { name: string; value: number }[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthDeals = deals.filter(d => {
        const dealDate = new Date(d.deal_createdAt);
        return dealDate >= monthStart && dealDate <= monthEnd;
      });
      
      const revenue = monthDeals.reduce((sum, d) => sum + (parseFloat(d.deal_value) || 0), 0);
      
      monthlyRevenue.push({
        name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(revenue)
      });
    }

    return monthlyRevenue;
  }
}

