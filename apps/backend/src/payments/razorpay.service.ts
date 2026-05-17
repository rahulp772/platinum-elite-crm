import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

export enum RazorpayErrorType {
  INVALID_PLAN = 'INVALID_PLAN',
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  CUSTOMER_ALREADY_EXISTS = 'CUSTOMER_ALREADY_EXISTS',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  RATE_LIMIT = 'RATE_LIMIT',
  WEBHOOK_VERIFICATION_FAILED = 'WEBHOOK_VERIFICATION_FAILED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface RazorpayError {
  type: RazorpayErrorType;
  code: string;
  description: string;
  source?: string;
  step?: string;
  reason?: string;
}

export interface CreateSubscriptionOptions {
  planId: string;
  customerId?: string;
  totalCount: number;
  quantity?: number;
  expireBy?: number;
  notes?: Record<string, string>;
  idempotencyKey?: string;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  planId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  customerId?: string;
}

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);
  private isTestMode: boolean;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    this.isTestMode = keyId?.startsWith('rzp_test_') || false;

    if (!keyId || !keySecret) {
      this.logger.warn('Razorpay credentials not configured');
    } else if (this.isTestMode) {
      this.logger.warn('Razorpay is in TEST mode - no real payments will be processed');
    } else {
      this.logger.log('Razorpay is in LIVE mode');
    }

    this.razorpay = new Razorpay({
      key_id: keyId || '',
      key_secret: keySecret || '',
    });
  }

  isTest(): boolean {
    return this.isTestMode;
  }

  getMode(): 'test' | 'live' {
    return this.isTestMode ? 'test' : 'live';
  }

  async createSubscription(options: CreateSubscriptionOptions): Promise<{
    id: string;
    status: string;
    short_url: string;
  }> {
    const planId = options.planId.startsWith('plan_')
      ? options.planId
      : `plan_${options.planId}`;

    const createData: any = {
      plan_id: planId,
      total_count: options.totalCount,
      quantity: options.quantity || 1,
      expire_by: options.expireBy,
      notes: options.notes,
    };

    if (options.customerId) {
      createData.customer_id = options.customerId;
    }

    const subscription: any = await this.razorpay.subscriptions.create(createData);

    return {
      id: subscription.id,
      status: subscription.status,
      short_url: subscription.short_url,
    };
  }

  async verifyPlanExists(planId: string): Promise<boolean> {
    const formattedPlanId = planId.startsWith('plan_')
      ? planId
      : `plan_${planId}`;

    try {
      const plan: any = await this.razorpay.plans.fetch(formattedPlanId);
      return plan && plan.id === formattedPlanId;
    } catch (error: any) {
      if (error.error?.code === 'BAD_REQUEST_ERROR' &&
        error.error?.description?.includes('Plan not found')) {
        this.logger.warn(`Razorpay plan not found: ${formattedPlanId}`);
        return false;
      }
      this.logger.error(`Failed to verify plan ${formattedPlanId}:`, error.message);
      return false;
    }
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const subscription: any = await this.razorpay.subscriptions.fetch(subscriptionId);

    return {
      id: subscription.id,
      status: subscription.status,
      planId: subscription.plan_id,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      customerId: subscription.customer_id ?? undefined,
    };
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtCycleEnd = true,
  ): Promise<{
    id: string;
    status: string;
  }> {
    const subscription: any = await this.razorpay.subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd,
    );

    return {
      id: subscription.id,
      status: subscription.status,
    };
  }

  async createCustomer(
    email: string,
    name: string,
    notes?: Record<string, string>,
  ): Promise<{
    id: string;
    email: string;
    name: string;
  }> {
    try {
      const existingCustomer = await this.getCustomerByEmail(email);
      if (existingCustomer) {
        this.logger.log(`Using existing Razorpay customer: ${existingCustomer.id}`);
        return existingCustomer;
      }

      const customer: any = await this.razorpay.customers.create({
        email,
        name,
        notes,
      });

      return {
        id: customer.id,
        email: customer.email ?? '',
        name: customer.name ?? '',
      };
    } catch (error: any) {
      if (error.error?.code === 'BAD_REQUEST_ERROR' && error.error?.description?.includes('Customer already exists')) {
        const existingCustomer = await this.getCustomerByEmail(email);
        if (existingCustomer) {
          return existingCustomer;
        }
      }
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw error;
    }
  }

  async getCustomerByEmail(email: string): Promise<{ id: string; email: string; name: string } | null> {
    try {
      const customers: any = await this.razorpay.customers.all({ email } as any);
      if (customers.items && customers.items.length > 0) {
        const customer = customers.items[0];
        return {
          id: customer.id,
          email: customer.email ?? '',
          name: customer.name ?? '',
        };
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to fetch customer by email', error);
      return null;
    }
  }

  async getPayment(paymentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    subscriptionId?: string;
  }> {
    const payment: any = await this.razorpay.payments.fetch(paymentId);

    return {
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      subscriptionId: payment.subscription_id,
    };
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('Webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    return signature === expectedSignature;
  }

  verifyPaymentSignature(
    subscriptionId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      this.logger.warn('Razorpay key secret not configured');
      return false;
    }

    const payload = `${paymentId}|${subscriptionId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    console.log({ subscriptionId, paymentId, expectedSignature, signature });

    return signature === expectedSignature;
  }

  parseError(error: any): RazorpayError {
    if (!error?.error) {
      return {
        type: RazorpayErrorType.UNKNOWN,
        code: 'UNKNOWN',
        description: error?.message || 'An unknown error occurred',
      };
    }

    const razorpayError = error.error;
    const code = razorpayError.code || 'UNKNOWN';
    const description = razorpayError.description || razorpayError.reason || 'Unknown error';

    let type: RazorpayErrorType = RazorpayErrorType.UNKNOWN;

    if (code.includes('BAD_REQUEST_ERROR')) {
      if (description.includes('Plan not found') || description.includes('plan_id')) {
        type = RazorpayErrorType.PLAN_NOT_FOUND;
      } else if (description.includes('Customer already exists')) {
        type = RazorpayErrorType.CUSTOMER_ALREADY_EXISTS;
      } else if (description.includes('Customer not found') || description.includes('customer_id')) {
        type = RazorpayErrorType.CUSTOMER_NOT_FOUND;
      } else if (description.includes('Subscription not found')) {
        type = RazorpayErrorType.SUBSCRIPTION_NOT_FOUND;
      } else if (description.includes('payment')) {
        type = RazorpayErrorType.PAYMENT_FAILED;
      }
    } else if (code.includes('GATEWAY_ERROR')) {
      type = RazorpayErrorType.PAYMENT_FAILED;
    } else if (code.includes('RATE_LIMIT')) {
      type = RazorpayErrorType.RATE_LIMIT;
    }

    return {
      type,
      code,
      description,
      source: razorpayError.source,
      step: razorpayError.step,
      reason: razorpayError.reason,
    };
  }
}