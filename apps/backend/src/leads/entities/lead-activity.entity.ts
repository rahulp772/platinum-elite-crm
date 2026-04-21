import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lead } from './lead.entity';

export enum LeadActivityAction {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  ASSIGNED = 'assigned',
  NOTE_ADDED = 'note_added',
  BUDGET_UPDATED = 'budget_updated',
  SOURCE_UPDATED = 'source_updated',
  FOLLOWUP_SCHEDULED = 'followup_scheduled',
  SITE_VISIT_SCHEDULED = 'site_visit_scheduled',
  SITE_VISIT_DONE = 'site_visit_done',
  RE_INQUIRY = 're_inquiry',
  VIEWED = 'viewed',
}

@Entity('lead_activities')
export class LeadActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: LeadActivityAction,
  })
  action: LeadActivityAction;

  @Column({ nullable: true })
  oldValue: string;

  @Column({ nullable: true })
  newValue: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  timestamp: Date;
}