import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';

export enum InfrastructureCategory {
  SCHOOL = 'school',
  HOSPITAL = 'hospital',
  TRANSIT = 'transit',
  RESTAURANT = 'restaurant',
  RESORT = 'resort',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

@Entity('nearby_infrastructures')
export class NearbyInfrastructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: InfrastructureCategory })
  category: InfrastructureCategory;

  @Column()
  name: string;

  @Column({ nullable: true })
  distance: string;

  @Column()
  propertyId: string;

  @ManyToOne(() => Property, (property) => property.nearbyInfrastructures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}