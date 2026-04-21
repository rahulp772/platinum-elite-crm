import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { LeadStatus, LeadSource, LostReason } from '../enums/lead.enum';
import { LeadActivity } from './lead-activity.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: LeadSource,
    default: LeadSource.WEBSITE,
  })
  source: LeadSource;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMin: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ nullable: true })
  preferredLocation: string;

  @Column({
    type: 'enum',
    enum: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', 'Penthouse', 'Plot', 'Row House', 'Villa', 'Apartment'],
    nullable: true,
  })
  propertyType: string;

  @Column({ nullable: true })
  bedroom: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, (user) => user.leads)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.leads, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'timestamp', nullable: true })
  lastContact: Date;

  @Column({ type: 'timestamp', nullable: true })
  followUpAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  siteVisitScheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  siteVisitDoneAt: Date;

  @Column({
    type: 'enum',
    enum: LostReason,
    nullable: true,
  })
  lostReason: LostReason;

  @Column({ type: 'timestamp', nullable: true })
  lostAt: Date;

  @Column({ nullable: true })
  whatsappNumber: string;

  @OneToMany(() => LeadActivity, (activity) => activity.lead)
  activities: LeadActivity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}