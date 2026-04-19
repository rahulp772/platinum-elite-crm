import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskStatus, TaskPriority, TaskType } from '../enums/task.enum';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.TODO,
  })
  type: TaskType;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  relatedToId: string;

  @Column({
    type: 'enum',
    enum: ['deal', 'property', 'lead'],
    nullable: true,
  })
  relatedToType: 'deal' | 'property' | 'lead';

  @ManyToOne(() => User, (user) => user.tasks)
  assignedTo: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
