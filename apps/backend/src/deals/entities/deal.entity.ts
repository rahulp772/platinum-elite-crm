import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { DealStage, DealPriority } from '../enums/deal.enum';

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: DealStage,
    default: DealStage.LEAD,
  })
  stage: DealStage;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column({ nullable: true })
  expectedCloseDate: Date;

  @Column({
    type: 'enum',
    enum: DealPriority,
    default: DealPriority.MEDIUM,
  })
  priority: DealPriority;

  @ManyToOne(() => Property, { nullable: true })
  property: Property | null;

  @ManyToOne(() => User, (user) => user.deals)
  agent: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
