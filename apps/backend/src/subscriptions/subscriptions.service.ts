import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, BillingCycle } from './entities/subscription.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Plan } from '../plans/entities/plan.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    private transactionsService: TransactionsService,
  ) {}

  async findByTenant(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { tenantId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantOrThrow(tenantId: string): Promise<Subscription> {
    const subscription = await this.findByTenant(tenantId);
    if (!subscription) {
      throw new NotFoundException('No subscription found for tenant');
    }
    return subscription;
  }

  async createSubscription(data: {
    tenantId: string;
    planId: string;
    billingCycle?: BillingCycle;
    addOns?: string[];
    currentUser: User;
  }): Promise<Subscription> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: data.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const plan = await this.planRepository.findOne({
      where: { id: data.planId },
    });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    const existing = await this.findByTenant(data.tenantId);
    if (existing) {
      throw new BadRequestException('Tenant already has a subscription. Use upgrade instead.');
    }

    const billingCycle = data.billingCycle || BillingCycle.MONTHLY;
    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === BillingCycle.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription = this.subscriptionRepository.create({
      tenantId: data.tenantId,
      planId: data.planId,
      billingCycle,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      addOns: data.addOns || [],
      autoRenew: true,
    });

const saved = await this.subscriptionRepository.save(subscription);

    return this.subscriptionRepository.findOne({
      where: { id: saved.id },
      relations: ['plan'],
    }) as Promise<Subscription>;
  }

  async upgrade(tenantId: string, newPlanId: string, currentUser: User): Promise<Subscription> {
    const subscription = await this.findByTenantOrThrow(tenantId);
    const oldPlan = subscription.plan;
    const newPlan = await this.planRepository.findOne({ where: { id: newPlanId } });

    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    subscription.planId = newPlanId;
    const updated = await this.subscriptionRepository.save(subscription);

    await this.transactionsService.createTransaction({
      tenantId,
      userId: currentUser.id,
      type: TransactionType.UPGRADE,
      amount: 0,
      planName: newPlan.displayName,
      description: `Upgraded from ${oldPlan?.displayName || 'None'} to ${newPlan.displayName}`,
      status: TransactionStatus.COMPLETED,
      billingDate: new Date(),
    });

    return this.subscriptionRepository.findOne({
      where: { id: updated.id },
      relations: ['plan'],
    }) as Promise<Subscription>;
  }

  async cancel(tenantId: string, currentUser: User): Promise<Subscription> {
    const subscription = await this.findByTenantOrThrow(tenantId);

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;

    const updated = await this.subscriptionRepository.save(subscription);

    await this.transactionsService.createTransaction({
      tenantId,
      userId: currentUser.id,
      type: TransactionType.REFUND,
      amount: 0,
      description: 'Subscription cancelled',
      status: TransactionStatus.COMPLETED,
    });

    return updated;
  }

  async addAddOn(tenantId: string, addOnName: string, currentUser: User): Promise<Subscription> {
    const subscription = await this.findByTenantOrThrow(tenantId);

    if (!subscription.addOns.includes(addOnName)) {
      subscription.addOns = [...subscription.addOns, addOnName];
    }

    return this.subscriptionRepository.save(subscription);
  }

  async removeAddOn(tenantId: string, addOnName: string, currentUser: User): Promise<Subscription> {
    const subscription = await this.findByTenantOrThrow(tenantId);

    subscription.addOns = subscription.addOns.filter((a) => a !== addOnName);

    return this.subscriptionRepository.save(subscription);
  }

  async assignRandomPlanToTenant(tenantId: string): Promise<Subscription> {
    const plans = await this.planRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    if (plans.length === 0) {
      throw new NotFoundException('No active plans found');
    }

    const randomPlan = plans[Math.floor(Math.random() * plans.length)];

    const existing = await this.findByTenant(tenantId);
    if (existing) {
      return existing;
    }

    const subscription = this.subscriptionRepository.create({
      tenantId,
      planId: randomPlan.id,
      billingCycle: BillingCycle.MONTHLY,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      addOns: [],
      autoRenew: false,
    });

    return this.subscriptionRepository.save(subscription);
  }
}
