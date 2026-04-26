import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  senderId: string;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ nullable: true })
  conversationId: string;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column('jsonb', { nullable: true })
  attachments: {
    url: string;
    type: 'image' | 'pdf' | 'other';
    name: string;
    size: number;
  }[];

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
