import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { PropertyStatus, PropertyType } from '../enums/property.enum';
import { Builder } from '../../builders/entities/builder.entity';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @Column({
    type: 'enum',
    enum: PropertyType,
  })
  type: PropertyType;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column({ nullable: true })
  bedrooms: number;

  @Column('float', { nullable: true })
  bathrooms: number;

  @Column()
  sqft: number;

  @Column({ nullable: true })
  lotSize: number;

  @Column({ nullable: true })
  yearBuilt: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('jsonb', { nullable: true })
  features: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  mlsId: string;

  @Column('float', { nullable: true, default: 0 })
  rating: number;

  // --- RERA & India Specific Fields ---
  @Column({ nullable: true })
  reraNumber: string;

  @Column({ nullable: true })
  reraAuthority: string;

  @Column({ nullable: true })
  reraWebsite: string;

  @Column({ nullable: true })
  landParcel: string;

  @Column({ nullable: true })
  surveyNumber: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  carpetArea: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  builtUpArea: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  superBuiltUpArea: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  basePrice: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerSqft: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  bookingAmount: number;

  @Column('text', { nullable: true })
  paymentPlan: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  plc: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  gst: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  parking: number;

  @Column({ nullable: true })
  launchDate: Date;

  @Column({ nullable: true })
  possessionDate: Date;

  @Column({ nullable: true })
  constructionStatus: string;

  @Column({ nullable: true })
  ccUrl: string;

  @Column({ nullable: true })
  ocUrl: string;

  @ManyToOne(() => Builder, (builder) => builder.properties, { nullable: true })
  @JoinColumn({ name: 'builderId' })
  builder: Builder;

  @Column({ nullable: true })
  builderId: string;
  // --- End RERA Fields ---

  @ManyToOne(() => User, (user) => user.properties)
  agent: User;

  @ManyToMany(() => User)
  @JoinTable({ name: 'property_favorites' })
  favoritedBy: User[];

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.properties, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  listed: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
