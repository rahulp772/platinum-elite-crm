import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { User } from '../users/entities/user.entity';

interface FindAllOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
}

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, user: User) {
    const property = this.propertyRepository.create({
      ...createPropertyDto,
      agent: user,
      tenantId: user.tenantId,
    });
    return this.propertyRepository.save(property);
  }

  async findAll(user: User, options: FindAllOptions) {
    const { page, limit, search, status, type, sortBy } = options;
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;

    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.agent', 'agent')
      .select(['property', 'agent.id', 'agent.name', 'agent.email']);

    if (!isGlobalAdmin) {
      query.where('property.tenantId = :tenantId', { tenantId: user.tenantId });
    }

    if (search) {
      query.andWhere(
        '(property.title ILIKE :search OR property.address ILIKE :search OR property.city ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status !== 'all') {
      query.andWhere('property.status = :status', { status });
    }

    if (type && type !== 'all') {
      query.andWhere('property.type = :type', { type });
    }

    switch (sortBy) {
      case 'oldest':
        query.orderBy('property.listed', 'ASC');
        break;
      case 'price_asc':
        query.orderBy('property.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('property.price', 'DESC');
        break;
      case 'views':
        query.orderBy('property.views', 'DESC');
        break;
      case 'newest':
      default:
        query.orderBy('property.listed', 'DESC');
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      metadata: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findRelated(id: string, type: string, limit = 3, user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;
    const baseCondition = isGlobalAdmin ? {} : { tenantId: user.tenantId };
    return this.propertyRepository.find({
      where: { ...baseCondition, id: Not(id), type: type as any },
      relations: ['agent'],
      take: limit,
    });
  }

  async findOne(id: string, user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;
    const where = isGlobalAdmin ? { id } : { id, tenantId: user.tenantId };
    const property = await this.propertyRepository.findOne({
      where,
      relations: ['agent'],
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, user: User) {
    const property = await this.findOne(id, user);
    Object.assign(property, updatePropertyDto);
    return this.propertyRepository.save(property);
  }

  async remove(id: string, user: User) {
    const property = await this.findOne(id, user);
    await this.propertyRepository.remove(property);
    return { message: 'Property deleted successfully' };
  }

  async toggleFavorite(id: string, user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;
    const where = isGlobalAdmin ? { id } : { id, tenantId: user.tenantId };
    const property = await this.propertyRepository.findOne({
      where,
      relations: ['favoritedBy'],
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const index = property.favoritedBy.findIndex((u) => u.id === user.id);
    if (index === -1) {
      property.favoritedBy.push(user);
    } else {
      property.favoritedBy.splice(index, 1);
    }

    await this.propertyRepository.save(property);
    return { favorited: index === -1 };
  }
}
