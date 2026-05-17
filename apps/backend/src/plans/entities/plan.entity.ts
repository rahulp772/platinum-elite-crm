import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  displayName: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  yearlyPrice: number;

  @Column({ type: 'int', default: 3 })
  userLimit: number;

  @Column({ type: 'int', default: 5000 })
  leadLimit: number;

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({ type: 'jsonb', default: [] })
  addOns: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: false })
  recommended: boolean;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  ctaText: string;

  @Column({ nullable: true })
  ctaLink: string;

  @Column({ nullable: true })
  minPrice: number;

  @Column({ nullable: true })
  razorpayPlanId: string;

  @Column({ type: 'int', nullable: true })
  trialDays: number;

  @Column({ default: 'INR' })
  currency: string;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
