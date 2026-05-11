import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  UPGRADE = 'upgrade',
  RENEWAL = 'renewal',
  REFUND = 'refund',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.transactions)
  tenant: Tenant;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.SUBSCRIPTION,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  planName: string;

  @Column({ nullable: true })
  planTier: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ type: 'timestamptz', nullable: true })
  billingDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextBillingDate: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
