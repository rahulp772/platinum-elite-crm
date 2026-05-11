import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';

export enum ImportStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DuplicateStrategy {
  SKIP = 'skip',
  UPDATE = 'update',
  DUPLICATE = 'duplicate',
}

@Entity('import_sessions')
export class ImportSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  originalFileName: string;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ type: 'int', default: 0 })
  totalRows: number;

  @Column({ type: 'int', default: 0 })
  processedRows: number;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'jsonb', nullable: true })
  mapping: Record<string, string>;

  @Column({
    type: 'varchar',
    default: ImportStatus.PENDING,
  })
  status: ImportStatus;

  @Column({ type: 'jsonb', nullable: true })
  errors: ImportError[];

  @Column({
    type: 'varchar',
    default: DuplicateStrategy.SKIP,
  })
  duplicateStrategy: DuplicateStrategy;

  @Column({ type: 'int', default: 500 })
  batchSize: number;

  @Column({ type: 'int', default: 0 })
  currentBatch: number;

  @Column({ type: 'int', default: 0 })
  totalBatches: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  originalValue?: string;
}

export interface ImportProgress {
  id: string;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  currentBatch: number;
  totalBatches: number;
  startedAt?: Date;
  completedAt?: Date;
  errors?: ImportError[];
  estimatedTimeRemaining?: number;
}
