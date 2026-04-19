import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  domain: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Property, (property) => property.tenant)
  properties: Property[];

  @OneToMany(() => Lead, (lead) => lead.tenant)
  leads: Lead[];

  @OneToMany(() => Deal, (deal) => deal.tenant)
  deals: Deal[];

  @OneToMany(() => Task, (task) => task.tenant)
  tasks: Task[];

  @OneToMany(() => Role, (role) => role.tenant)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
