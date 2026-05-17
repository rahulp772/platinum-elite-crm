import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import {
  Subscription,
  SubscriptionStatus,
  BillingCycle,
} from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { TransactionsService } from '../transactions/transactions.service';
import {
  TransactionType,
  TransactionStatus,
} from '../transactions/entities/transaction.entity';
import { RazorpayService } from './razorpay.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private trialDays: number;

  constructor(
    private configService: ConfigService,
    private razorpayService: RazorpayService,
    private transactionsService: TransactionsService,
    private subscriptionsService: SubscriptionsService,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {
    this.trialDays = this.configService.get<number>('TRIAL_DAYS', 14);
  }

  async createSubscriptionForTenant(
    tenantId: string,
    planId: string,
    billingCycle: BillingCycle = BillingCycle.MONTHLY,
    user?: User,
  ): Promise<{
    subscriptionId: string;
    shortUrl: string;
    status: string;
  }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const plan = await this.planRepository.findOne({
      where: { id: planId },
    });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    if (
      existingSubscription &&
      [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAUSED].includes(existingSubscription.status)
    ) {
      throw new BadRequestException(
        'Tenant already has an active subscription. Use upgrade instead.',
      );
    }

    const razorpayPlanId = billingCycle === BillingCycle.YEARLY
      ? plan.razorpayYearlyPlanId
      : plan.razorpayPlanId;
    if (!razorpayPlanId) {
      throw new BadRequestException(
        `Plan not configured for payment (${billingCycle}). Please contact support.`,
      );
    }

    const planExists = await this.razorpayService.verifyPlanExists(razorpayPlanId);
    if (!planExists) {
      this.logger.error(`Razorpay plan not found: ${razorpayPlanId}`);
      throw new BadRequestException(
        'Plan configuration error. Please contact support.',
      );
    }

    if (plan.monthlyPrice === 0 && plan.yearlyPrice === 0) {
      throw new BadRequestException(
        'Free plans cannot be purchased online. Please contact support.',
      );
    }

    const totalCount = billingCycle === BillingCycle.YEARLY ? 10 : 120;

    const customerEmail = user?.email || `${tenant.name.toLowerCase().replace(/\s+/g, '.')}@makeitcrm.com`;

    let customerId: string;
    try {
      let customer;
      if (tenant.razorpayCustomerId) {
        customer = { id: tenant.razorpayCustomerId };
      } else {
        customer = await this.razorpayService.createCustomer(
          customerEmail,
          user?.name || tenant.name,
          { tenantId },
        );
      }
      customerId = customer.id;

      if (!tenant.razorpayCustomerId) {
        tenant.razorpayCustomerId = customerId;
        await this.tenantRepository.save(tenant);
      }
    } catch (error) {
      this.logger.error('Failed to create Razorpay customer', error);
      throw new BadRequestException(
        'Failed to initialize payment. Please try again.',
      );
    }

    let subscription;
    const planTrialDays = plan.trialDays ?? this.trialDays;
    const idempotencyKey = `sub_${tenantId}_${planId}_${billingCycle}_${Date.now()}`;
    try {
      subscription = await this.razorpayService.createSubscription({
        planId: razorpayPlanId,
        customerId,
        totalCount,
        idempotencyKey,
        notes: {
          tenantId,
          planId,
          billingCycle,
        },
      });
    } catch (error: any) {
      if (error.error?.code === 'BAD_REQUEST_ERROR' && error.error?.description?.includes('Idempotency key present')) {
        this.logger.warn('Duplicate subscription creation attempt detected');
      }
      this.logger.error('Failed to create Razorpay subscription', error);
      throw new BadRequestException(
        'Failed to create subscription. Please try again.',
      );
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + this.trialDays);

    const paymentMode = this.razorpayService.isTest() ? 'test' : 'live';

    const subscriptionEntity = this.subscriptionRepository.create({
      tenantId,
      planId,
      billingCycle,
      status: SubscriptionStatus.TRIAL,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      externalSubscriptionId: subscription.id,
      autoRenew: true,
      addOns: [],
      paymentMode,
    });

    await this.subscriptionRepository.save(subscriptionEntity);

    await this.subscriptionsService.syncTenantPlanName(tenantId);

    if (user) {
      await this.transactionsService.createTransaction({
        tenantId,
        userId: user.id,
        type: TransactionType.SUBSCRIPTION,
        amount:
          billingCycle === BillingCycle.YEARLY
            ? plan.yearlyPrice
            : plan.monthlyPrice,
        planName: plan.displayName,
        description: `${plan.displayName} - Subscription initiated`,
        status: TransactionStatus.PENDING,
        paymentMethod: 'razorpay',
        transactionId: subscription.id,
        billingDate: now,
        nextBillingDate: trialEnd,
      });
    }

    return {
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
      status: subscription.status,
    };
  }

  async verifyAndActivateSubscription(
    subscriptionId: string,
    paymentId: string,
    tenantId: string,
    user?: User,
    signature?: string,
  ): Promise<{ success: boolean; subscription: Subscription }> {
    try {
      const payment = await this.razorpayService.getPayment(paymentId);
      console.log({ payment })

      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        throw new BadRequestException('Payment not captured or authorized');
      }

      if (payment.subscriptionId && payment.subscriptionId !== subscriptionId) {
        this.logger.warn(`Payment ${paymentId} does not belong to subscription ${subscriptionId}`);
        throw new BadRequestException('Invalid payment for this subscription');
      }

      if (signature) {
        const isValidSignature = this.razorpayService.verifyPaymentSignature(
          subscriptionId,
          paymentId,
          signature,
        );
        if (!isValidSignature) {
          this.logger.warn(`Invalid signature for payment ${paymentId}, subscription ${subscriptionId}`);
          throw new BadRequestException('Invalid payment signature');
        }
      }

      const subscription = await this.subscriptionRepository.findOne({
        where: { tenantId, externalSubscriptionId: subscriptionId },
        relations: ['plan'],
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      subscription.status = SubscriptionStatus.ACTIVE;
      const now = new Date();
      const periodEnd = new Date(now);

      if (subscription.billingCycle === BillingCycle.MONTHLY) {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;

      const updated = await this.subscriptionRepository.save(subscription);

      await this.subscriptionsService.syncTenantPlanName(tenantId);

      if (user) {
        const plan = subscription.plan;
        const pendingTx = await this.transactionsService.findPendingByTenant(tenantId);
        if (pendingTx) {
          pendingTx.status = TransactionStatus.COMPLETED;
          pendingTx.description = `${plan?.displayName} - Subscription activated`;
          pendingTx.transactionId = paymentId;
          pendingTx.billingDate = now;
          pendingTx.nextBillingDate = periodEnd;
          await this.transactionsService.updateTransaction(pendingTx);
        } else {
          await this.transactionsService.createTransaction({
            tenantId,
            userId: user.id,
            type: TransactionType.SUBSCRIPTION,
            amount:
              subscription.billingCycle === BillingCycle.YEARLY
                ? plan?.yearlyPrice || 0
                : plan?.monthlyPrice || 0,
            planName: plan?.displayName,
            description: `${plan?.displayName} - Subscription activated`,
            status: TransactionStatus.COMPLETED,
            paymentMethod: 'razorpay',
            transactionId: paymentId,
            billingDate: now,
            nextBillingDate: periodEnd,
          });
        }
      }

      return { success: true, subscription: updated };
    } catch (error) {
      this.logger.error('Failed to verify subscription', error);
      throw error;
    }
  }

  async handleWebhook(
    event: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const { subscription } = payload;
    if (!subscription?.id) {
      this.logger.warn('No subscription ID in webhook payload');
      return;
    }

    const tenantId = subscription.notes?.tenantId;
    if (!tenantId) {
      this.logger.warn('No tenant ID in subscription notes');
      return;
    }

    const existingSub = await this.subscriptionRepository.findOne({
      where: { externalSubscriptionId: subscription.id },
      relations: ['plan'],
    });

    if (!existingSub) {
      this.logger.warn(`Subscription ${subscription.id} not found in database`);
      return;
    }

    switch (event) {
      case 'subscription.activated':
        existingSub.status = SubscriptionStatus.ACTIVE;
        existingSub.currentPeriodStart = new Date(
          subscription.current_period_start * 1000,
        );
        existingSub.currentPeriodEnd = new Date(
          subscription.current_period_end * 1000,
        );
        await this.subscriptionRepository.save(existingSub);
        this.logger.log(`Subscription ${subscription.id} activated`);
        break;

      case 'subscription.charged':
        if (existingSub.status === SubscriptionStatus.TRIAL) {
          existingSub.status = SubscriptionStatus.ACTIVE;
        }
        existingSub.currentPeriodStart = new Date(
          subscription.current_period_start * 1000,
        );
        existingSub.currentPeriodEnd = new Date(
          subscription.current_period_end * 1000,
        );
        await this.subscriptionRepository.save(existingSub);
        this.logger.log(`Subscription ${subscription.id} charged and activated`);
        break;

      case 'subscription.cancelled':
        existingSub.status = SubscriptionStatus.CANCELLED;
        existingSub.cancelledAt = new Date();
        existingSub.autoRenew = false;
        await this.subscriptionRepository.save(existingSub);
        this.logger.log(`Subscription ${subscription.id} cancelled`);
        break;

      case 'subscription.paused':
        existingSub.status = SubscriptionStatus.PAUSED;
        await this.subscriptionRepository.save(existingSub);
        this.logger.log(`Subscription ${subscription.id} paused`);
        break;

      case 'subscription.resumed':
        existingSub.status = SubscriptionStatus.ACTIVE;
        await this.subscriptionRepository.save(existingSub);
        this.logger.log(`Subscription ${subscription.id} resumed`);
        break;

      case 'subscription.pending':
        this.logger.log(`Subscription ${subscription.id} is pending`);
        break;

      case 'subscription.halted':
        existingSub.status = SubscriptionStatus.CANCELLED;
        existingSub.cancelledAt = new Date();
        existingSub.autoRenew = false;
        await this.subscriptionRepository.save(existingSub);
        this.logger.log(`Subscription ${subscription.id} halted`);
        break;

      case 'payment.failed':
        const paymentEntity = payload.payment;
        if (paymentEntity) {
          this.logger.warn(`Payment failed for subscription ${subscription.id}: ${paymentEntity.error_code}`);

          const failedPayment = {
            paymentId: paymentEntity.id,
            errorCode: paymentEntity.error_code || 'UNKNOWN',
            errorDescription: paymentEntity.error_description || paymentEntity.error_reason || 'Payment failed',
            failedAt: new Date(),
          };

          existingSub.failedPayments = [...(existingSub.failedPayments || []), failedPayment];
          existingSub.paymentRetryCount = (existingSub.paymentRetryCount || 0) + 1;

          if (existingSub.paymentRetryCount < 3) {
            const retryDelayDays = Math.pow(2, existingSub.paymentRetryCount);
            existingSub.nextRetryDate = new Date();
            existingSub.nextRetryDate.setDate(existingSub.nextRetryDate.getDate() + retryDelayDays);
            this.logger.log(`Scheduled retry ${existingSub.paymentRetryCount} for subscription ${subscription.id} on ${existingSub.nextRetryDate}`);
          } else {
            existingSub.status = SubscriptionStatus.CANCELLED;
            existingSub.autoRenew = false;
            existingSub.cancelledAt = new Date();
            this.logger.warn(`Max retries reached for subscription ${subscription.id}. Subscription cancelled.`);
          }

          await this.subscriptionRepository.save(existingSub);

          await this.transactionsService.createTransaction({
            tenantId,
            type: TransactionType.SUBSCRIPTION,
            amount: 0,
            planName: existingSub.plan?.displayName || 'Plan',
            description: `Payment failed: ${failedPayment.errorDescription}`,
            status: TransactionStatus.FAILED,
            paymentMethod: 'razorpay',
            transactionId: paymentEntity.id,
            billingDate: new Date(),
          });
        }
        break;

      case 'subscription.charged_amount':
        const chargedPayment = payload.payment;
        if (chargedPayment) {
          const amount = Number(chargedPayment.amount) / 100;
          this.logger.log(`Subscription ${subscription.id} charged: ₹${amount}`);

          if (existingSub.status === SubscriptionStatus.TRIAL) {
            existingSub.status = SubscriptionStatus.ACTIVE;
          }
          existingSub.currentPeriodStart = new Date(
            subscription.current_period_start * 1000,
          );
          existingSub.currentPeriodEnd = new Date(
            subscription.current_period_end * 1000,
          );
          existingSub.lastChargedAmount = amount;
          existingSub.lastPaymentId = chargedPayment.id;
          existingSub.nextScheduledCharge = new Date(
            subscription.current_period_end * 1000,
          );

          if (chargedPayment.invoice_id) {
            existingSub.currentInvoiceId = chargedPayment.invoice_id;
            existingSub.invoiceHistory = [
              ...(existingSub.invoiceHistory || []),
              {
                invoiceId: chargedPayment.invoice_id,
                amount,
                status: 'paid',
                paidAt: new Date(),
              },
            ];
          }

          await this.subscriptionRepository.save(existingSub);

          const isProration = chargedPayment.amount_refunded > 0 ||
            (chargedPayment.notes && chargedPayment.notes.is_proration);

          const description = isProration
            ? `Prorated payment received - ₹${amount}`
            : `Recurring payment received - ₹${amount}`;

          if (isProration) {
            existingSub.prorationDetails = {
              type: chargedPayment.notes?.proration_type || 'adjustment',
              amount,
              previousPlanId: chargedPayment.notes?.previous_plan_id,
              newPlanId: chargedPayment.notes?.new_plan_id,
            };
            await this.subscriptionRepository.save(existingSub);
          }

          await this.transactionsService.createTransaction({
            tenantId,
            type: TransactionType.SUBSCRIPTION,
            amount,
            planName: existingSub.plan?.displayName || 'Plan',
            description,
            status: TransactionStatus.COMPLETED,
            paymentMethod: 'razorpay',
            transactionId: chargedPayment.id,
            billingDate: new Date(),
            nextBillingDate: new Date(subscription.current_period_end * 1000),
          });
          this.logger.log(`Transaction recorded for charged amount: ₹${amount}`);
        }
        break;

      case 'subscription.changed':
        const rzpPlanId = subscription.plan_id;
        const notes = subscription.notes || {};

        const newPlan = await this.planRepository.findOne({
          where: [
            { razorpayPlanId: rzpPlanId },
            { razorpayYearlyPlanId: rzpPlanId },
          ],
        });

        if (newPlan && existingSub.planId !== newPlan.id) {
          existingSub.planId = newPlan.id;
          existingSub.plan = newPlan;
          if (notes.billingCycle) {
            existingSub.billingCycle = notes.billingCycle === 'yearly'
              ? BillingCycle.YEARLY
              : BillingCycle.MONTHLY;
          }
          await this.subscriptionRepository.save(existingSub);
          
          if (tenantId) {
            await this.subscriptionsService.syncTenantPlanName(tenantId);
          }
          
          this.logger.log(`Subscription ${subscription.id} changed to plan ${newPlan.displayName}`);
        }
        break;

      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  async cancelSubscription(
    tenantId: string,
    cancelAtCycleEnd = true,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    if (cancelAtCycleEnd) {
      if (subscription.externalSubscriptionId) {
        try {
          await this.razorpayService.cancelSubscription(
            subscription.externalSubscriptionId,
            true,
          );
        } catch (error) {
          this.logger.error('Failed to cancel Razorpay subscription at cycle end', error);
        }
      }
      subscription.autoRenew = false;
      subscription.cancelledAt = new Date();
      return this.subscriptionRepository.save(subscription);
    } else {
      if (subscription.externalSubscriptionId) {
        try {
          await this.razorpayService.cancelSubscription(
            subscription.externalSubscriptionId,
            false,
          );
        } catch (error) {
          this.logger.error('Failed to cancel Razorpay subscription immediately', error);
        }
      }
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
      subscription.autoRenew = false;
      return this.subscriptionRepository.save(subscription);
    }
  }

  async upgradeSubscription(
    tenantId: string,
    newPlanId: string,
    billingCycle: BillingCycle = BillingCycle.MONTHLY,
    user?: User,
  ): Promise<{
    success: boolean;
    message: string;
    subscriptionId?: string;
    shortUrl?: string;
    paymentPending?: boolean;
  }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { tenantId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found. Please subscribe first.');
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException(
        'Your subscription is cancelled. Please subscribe to a new plan.',
      );
    }

    const newPlan = await this.planRepository.findOne({
      where: { id: newPlanId },
    });
    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    const oldPlan = subscription.plan;
    const isSamePlan = oldPlan && newPlan.id === oldPlan.id;
    const isSameBillingCycle = subscription.billingCycle === billingCycle;
    if (isSamePlan && isSameBillingCycle) {
      throw new BadRequestException('You are already on this plan.');
    }

    if (newPlan.monthlyPrice === 0 && newPlan.yearlyPrice === 0) {
      throw new BadRequestException(
        'Free plans cannot be purchased online. Please contact support.',
      );
    }

    const razorpayPlanId = billingCycle === BillingCycle.YEARLY
      ? newPlan.razorpayYearlyPlanId
      : newPlan.razorpayPlanId;
    if (!razorpayPlanId) {
      throw new BadRequestException(
        `New plan not configured for payment (${billingCycle}). Please contact support.`,
      );
    }

    const newPlanExists = await this.razorpayService.verifyPlanExists(razorpayPlanId);
    if (!newPlanExists) {
      this.logger.error(`Razorpay plan not found for upgrade: ${razorpayPlanId}`);
      throw new BadRequestException(
        'New plan configuration error. Please contact support.',
      );
    }

    const oldPlanName = oldPlan?.displayName || 'Previous';
    const totalCount = billingCycle === BillingCycle.YEARLY ? 10 : 120;
    const customerId = tenant.razorpayCustomerId;

    if (!customerId) {
      throw new BadRequestException(
        'No customer found. Please contact support.',
      );
    }

    let newSubscription;
    const idempotencyKey = `upgrade_${tenantId}_${newPlanId}_${billingCycle}_${Date.now()}`;

    try {
      newSubscription = await this.razorpayService.createSubscription({
        planId: razorpayPlanId,
        customerId,
        totalCount,
        idempotencyKey,
        notes: {
          tenantId,
          planId: newPlanId,
          billingCycle,
          type: 'upgrade',
          oldPlanId: subscription.planId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create Razorpay subscription for upgrade', error);
      throw new BadRequestException(
        'Failed to create upgrade. Please try again.',
      );
    }

    if (subscription.externalSubscriptionId) {
      try {
        await this.razorpayService.cancelSubscription(
          subscription.externalSubscriptionId,
          true,
        );
        this.logger.log(`Cancelled old subscription ${subscription.externalSubscriptionId} at cycle end`);
      } catch (error: any) {
        if (error.error?.code === 'BAD_REQUEST_ERROR' &&
            error.error?.description?.includes('not cancellable')) {
          this.logger.log(`Old subscription ${subscription.externalSubscriptionId} already in terminal state, skipping cancel`);
        } else {
          this.logger.warn('Failed to cancel old subscription', error);
        }
      }
    }

    const isValidShortUrl = newSubscription.short_url &&
      (newSubscription.short_url.startsWith('https://rzp.io/') ||
        newSubscription.short_url.startsWith('https://checkout.razorpay.com/'));

    subscription.planId = newPlanId;
    subscription.plan = newPlan;
    subscription.billingCycle = billingCycle;
    subscription.externalSubscriptionId = newSubscription.id;
    subscription.status = isValidShortUrl ? SubscriptionStatus.PENDING : SubscriptionStatus.PENDING;
    subscription.autoRenew = true;
    subscription.currentPeriodStart = new Date();
    subscription.paymentMode = this.razorpayService.isTest() ? 'test' : 'live';

    const periodEnd = new Date();
    if (billingCycle === BillingCycle.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }
    subscription.currentPeriodEnd = periodEnd;

    await this.subscriptionRepository.save(subscription);

    await this.subscriptionsService.syncTenantPlanName(tenantId);

    if (user && newPlan) {
      await this.transactionsService.createTransaction({
        tenantId,
        userId: user.id,
        type: TransactionType.UPGRADE,
        amount:
          billingCycle === BillingCycle.YEARLY
            ? newPlan.yearlyPrice
            : newPlan.monthlyPrice,
        planName: newPlan.displayName,
        description: `Upgraded from ${oldPlanName} to ${newPlan.displayName}`,
        status: TransactionStatus.PENDING,
        paymentMethod: 'razorpay',
        transactionId: newSubscription.id,
        billingDate: new Date(),
      });
    }

    this.logger.log(`Tenant ${tenantId} upgraded from plan ${oldPlan?.id} to ${newPlanId}`);

    const message = isValidShortUrl
      ? `Upgrade initiated. Please complete payment.`
      : `Upgrade initiated. Payment pending - please try again from pricing page or contact support.`;

    return {
      success: true,
      message,
      subscriptionId: newSubscription.id,
      shortUrl: isValidShortUrl ? newSubscription.short_url : null,
      paymentPending: !isValidShortUrl,
    };
  }
}
