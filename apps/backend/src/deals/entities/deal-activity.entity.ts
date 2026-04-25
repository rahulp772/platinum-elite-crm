import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Deal } from './deal.entity';

export enum DealActivityAction {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  STAGE_CHANGED = 'stage_changed',
  NOTE_ADDED = 'note_added',
  VALUE_UPDATED = 'value_updated',
  PROPERTY_LINKED = 'property_linked',
  PROPERTY_UNLINKED = 'property_unlinked',
  ASSIGNED = 'assigned',
  REASSIGNED = 'reassigned',
  PRIORITY_CHANGED = 'priority_changed',
  EXPECTED_CLOSE_UPDATED = 'expected_close_updated',
  VIEWED = 'viewed',
}

@Entity('deal_activities')
export class DealActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dealId: string;

  @ManyToOne(() => Deal, (deal) => deal.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealId' })
  deal: Deal;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: DealActivityAction,
  })
  action: DealActivityAction;

  @Column({ nullable: true })
  oldValue: string;

  @Column({ nullable: true })
  newValue: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  timestamp: Date;
}