import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Role } from '../../roles/entities/role.entity';
import { Builder } from '../../builders/entities/builder.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ default: false })
  isDemo: boolean;

  @Column({ default: true })
  isTrial: boolean;

  @Column({ nullable: true })
  trialStartDate: Date;

  @Column({ nullable: true })
  trialEndDate: Date;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  planName: string;

  @Column({ nullable: true, default: 'trial' })
  subscriptionStatus: string;

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionStartDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionEndDate: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Property, (property) => property.tenant)
  properties: Property[];

  @OneToMany(() => Lead, (lead) => lead.tenant)
  leads: Lead[];

  @OneToMany(() => Deal, (deal) => deal.tenant)
  deals: Deal[];

  @OneToMany(() => Task, (task) => task.tenant)
  tasks: Task[];

  @OneToMany(() => Role, (role) => role.tenant)
  roles: Role[];

  @OneToMany(() => Builder, (builder) => builder.tenant)
  builders: Builder[];

  @OneToMany(() => Transaction, (transaction) => transaction.tenant)
  transactions: Transaction[];

  @OneToMany(() => Subscription, (subscription) => subscription.tenant)
  subscriptions: Subscription[];

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: 'Asia/Kolkata' })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
