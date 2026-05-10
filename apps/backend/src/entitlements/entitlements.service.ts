import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Plan } from '../plans/entities/plan.entity';

export interface TenantEntitlements {
  planId: string;
  planName: string;
  planSlug: string;
  userLimit: number;
  leadLimit: number;
  features: string[];
  addOns: string[];
  isUnlimited: boolean;
  currentUsers: number;
  currentLeads: number;
}

@Injectable()
export class EntitlementsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async getTenantEntitlements(tenantId: string): Promise<TenantEntitlements | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { tenantId },
      relations: ['plan'],
    });

    if (!subscription) {
      return null;
    }

    const userCount = await this.userRepository.count({ where: { tenantId } });
    const leadCount = await this.leadRepository.count({ where: { tenantId } });

    const plan = subscription.plan;
    const isUnlimited = plan.userLimit === -1 && plan.leadLimit === -1;

    return {
      planId: plan.id,
      planName: plan.displayName,
      planSlug: plan.slug,
      userLimit: plan.userLimit,
      leadLimit: plan.leadLimit,
      features: plan.features || [],
      addOns: plan.addOns || [],
      isUnlimited,
      currentUsers: userCount,
      currentLeads: leadCount,
    };
  }

  async canAddUser(tenantId: string): Promise<{ allowed: boolean; message?: string }> {
    const entitlements = await this.getTenantEntitlements(tenantId);

    if (!entitlements) {
      return { allowed: true, message: 'No subscription - using default limits' };
    }

    if (entitlements.isUnlimited) {
      return { allowed: true };
    }

    if (entitlements.currentUsers >= entitlements.userLimit) {
      return {
        allowed: false,
        message: `User limit reached. Your ${entitlements.planName} plan allows ${entitlements.userLimit} users. Please upgrade to add more.`,
      };
    }

    return { allowed: true };
  }

  async canAddLead(tenantId: string): Promise<{ allowed: boolean; message?: string }> {
    const entitlements = await this.getTenantEntitlements(tenantId);

    if (!entitlements) {
      return { allowed: true, message: 'No subscription - using default limits' };
    }

    if (entitlements.isUnlimited) {
      return { allowed: true };
    }

    if (entitlements.currentLeads >= entitlements.leadLimit) {
      return {
        allowed: false,
        message: `Lead limit reached. Your ${entitlements.planName} plan allows ${entitlements.leadLimit} leads. Please upgrade to add more.`,
      };
    }

    return { allowed: true };
  }

  hasFeature(entitlements: TenantEntitlements | null, feature: string): boolean {
    if (!entitlements) {
      return true;
    }
    return entitlements.features.includes(feature);
  }

  hasAddOn(entitlements: TenantEntitlements | null, addOn: string): boolean {
    if (!entitlements) {
      return false;
    }
    return entitlements.addOns.includes(addOn);
  }

  async checkUserLimitForTenant(tenantId: string): Promise<void> {
    const result = await this.canAddUser(tenantId);
    if (!result.allowed) {
      throw new ForbiddenException(result.message);
    }
  }

  async checkLeadLimitForTenant(tenantId: string): Promise<void> {
    const result = await this.canAddLead(tenantId);
    if (!result.allowed) {
      throw new ForbiddenException(result.message);
    }
  }

  async getAvailableFeatures(tenantId: string): Promise<string[]> {
    const entitlements = await this.getTenantEntitlements(tenantId);
    return entitlements?.features || [];
  }
}
