import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { User } from '../users/entities/user.entity';
import { FloorPlansService } from '../floor-plans/floor-plans.service';
import { NearbyInfrastructuresService } from '../nearby-infrastructure/nearby-infrastructures.service';

interface FindAllOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  builderId?: string;
  favorited?: boolean;
}

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private floorPlansService: FloorPlansService,
    private nearbyInfrastructuresService: NearbyInfrastructuresService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, user: User) {
    const { pricePerSqft, launchDate, possessionDate, ...rest } = createPropertyDto as CreatePropertyDto & { pricePerSqft?: number; launchDate?: string; possessionDate?: string };

    const dataToSave: Partial<Property> = {
      ...rest,
      agent: user,
      tenantId: user.tenantId,
    };

    if (!pricePerSqft && rest.price && rest.sqft && rest.sqft > 0) {
      dataToSave.pricePerSqft = Number((rest.price / rest.sqft).toFixed(2));
    }

    if (rest.totalLandArea) dataToSave.totalLandArea = rest.totalLandArea;
    if (rest.unitCount) dataToSave.unitCount = rest.unitCount;
    if (rest.minPlotSize) dataToSave.minPlotSize = rest.minPlotSize;
    if (rest.maxPlotSize) dataToSave.maxPlotSize = rest.maxPlotSize;
    if (rest.ratePerSqft) dataToSave.ratePerSqft = rest.ratePerSqft;
    if (rest.dtcpApproval) dataToSave.dtcpApproval = rest.dtcpApproval;
    if (launchDate) dataToSave.launchDate = new Date(launchDate);
    if (possessionDate) dataToSave.possessionDate = new Date(possessionDate);

    const property = this.propertyRepository.create(dataToSave as Property);
    return this.propertyRepository.save(property);
  }

  async findAll(user: User, options: FindAllOptions) {
    const { page, limit, search, status, type, sortBy, builderId, favorited } = options;

    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;

    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.agent', 'agent')
      .leftJoinAndSelect('property.builder', 'builder')
      .leftJoinAndSelect('property.favoritedBy', 'favoritedBy')
      .select(['property', 'agent.id', 'agent.name', 'agent.email', 'builder']);

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

    if (builderId) {
      query.andWhere('property.builderId = :builderId', { builderId });
    }

    if (favorited === true) {
      query.andWhere('favoritedBy.id = :userId', { userId: user.id });
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

    const dataWithFavorited = data.map(property => ({
      ...property,
      favorited: property.favoritedBy?.some(f => f.id === user.id) || false,
    }));

    return {
      data: dataWithFavorited,
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
      relations: ['agent', 'builder', 'floorPlans', 'nearbyInfrastructures', 'favoritedBy'],
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return {
      ...property,
      favorited: property.favoritedBy?.some(f => f.id === user.id) || false,
    };
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

  async addFloorPlans(propertyId: string, dtos: { plotSize: number; price: number; label?: string; planImage?: string }[], user: User) {
    await this.findOne(propertyId, user);
    return this.floorPlansService.createBulk(dtos.map((d) => ({ ...d, propertyId })), user);
  }

  async addNearbyInfrastructures(propertyId: string, dtos: { category: string; name: string; distance?: string }[], user: User) {
    await this.findOne(propertyId, user);
    return this.nearbyInfrastructuresService.createBulk(dtos.map((d) => ({ ...d, propertyId })) as any, user);
  }
}