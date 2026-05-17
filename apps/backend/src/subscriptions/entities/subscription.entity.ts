import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Plan } from '../../plans/entities/plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.subscriptions, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  planId: string;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, { nullable: true })
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodStart: Date;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date;

  @Column({ type: 'jsonb', default: [] })
  addOns: string[];

  @Column({ default: true })
  autoRenew: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  pausedAt: Date;

  @Column({ nullable: true })
  externalSubscriptionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lastChargedAmount: number;

  @Column({ nullable: true })
  lastPaymentId: string;

  @Column({ type: 'jsonb', nullable: true })
  prorationDetails: {
    type: string;
    amount: number;
    previousPlanId?: string;
    newPlanId?: string;
  };

  @Column({ type: 'timestamptz', nullable: true })
  nextScheduledCharge: Date;

  @Column({ type: 'int', default: 0 })
  paymentRetryCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  nextRetryDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  failedPayments: {
    paymentId: string;
    errorCode: string;
    errorDescription: string;
    failedAt: Date;
  }[];

  @Column({ nullable: true })
  currentInvoiceId: string;

  @Column({ type: 'jsonb', nullable: true })
  invoiceHistory: {
    invoiceId: string;
    amount: number;
    status: string;
    paidAt: Date;
  }[];

  @Column({ default: 'test' })
  paymentMode: 'test' | 'live';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
