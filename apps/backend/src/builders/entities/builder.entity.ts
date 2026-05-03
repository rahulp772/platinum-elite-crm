import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('builders')
export class Builder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  foundedYear: number;

  @Column({ nullable: true })
  headquarters: string;

  @Column({ default: 0 })
  totalProjects: number;

  @Column({ default: 0 })
  completedProjects: number;

  @Column({ default: 0 })
  ongoingProjects: number;

  @OneToMany(() => Property, (property) => property.builder)
  properties: Property[];

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.builders, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
