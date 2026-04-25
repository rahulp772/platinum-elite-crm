import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_user', ['userId'])
@Index('idx_audit_tenant', ['tenantId'])
@Index('idx_audit_action', ['action'])
@Index('idx_audit_created', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100, nullable: true })
  resource: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ length: 500, nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}