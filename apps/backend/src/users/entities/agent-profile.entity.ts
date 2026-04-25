import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('agent_profiles')
export class AgentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'junior' })
  experienceLevel: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  closingRate: number;

  @Column('int', { default: 0 })
  activeLeadCount: number;

  @Column('simple-array', { nullable: true })
  locationSpecializations: string[];

  @Column('simple-array', { nullable: true })
  budgetSpecializations: string[];

  @Column({ nullable: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
