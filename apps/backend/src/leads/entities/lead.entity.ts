import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { LeadStatus, LeadSource } from '../enums/lead.enum';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
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

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  propertyType: string;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.leads)
  assignedTo: User;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.leads, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  lastContact: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
