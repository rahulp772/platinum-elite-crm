import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PropertyStatus, PropertyType } from '../enums/property.enum';

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

  @Column('simple-array', { nullable: true })
  features: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  mlsId: string;

  @Column('float', { nullable: true, default: 0 })
  rating: number;

  @ManyToOne(() => User, (user) => user.properties)
  agent: User;

  @ManyToMany(() => User)
  @JoinTable({ name: 'property_favorites' })
  favoritedBy: User[];

  @CreateDateColumn()
  listed: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
