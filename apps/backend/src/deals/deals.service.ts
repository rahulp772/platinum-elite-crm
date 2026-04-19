import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async create(createDealDto: CreateDealDto, user: User) {
    const { propertyId, ...dealData } = createDealDto;
    let property: Property | null = null;

    if (propertyId) {
      const foundProperty = await this.propertyRepository.findOne({ where: { id: propertyId } });
      if (!foundProperty) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }
      property = foundProperty;
    }

    const deal = this.dealRepository.create({
      ...dealData,
      agent: user,
      property,
    });
    return this.dealRepository.save(deal);
  }

  async findAll() {
    return this.dealRepository.find({ relations: ['agent', 'property'] });
  }

  async findOne(id: string) {
    const deal = await this.dealRepository.findOne({
      where: { id },
      relations: ['agent', 'property'],
    });
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }
    return deal;
  }

  async update(id: string, updateDealDto: UpdateDealDto) {
    const deal = await this.findOne(id);
    const { propertyId, ...dealData } = updateDealDto;

    if (propertyId) {
      const foundProperty = await this.propertyRepository.findOne({ where: { id: propertyId } });
      if (!foundProperty) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }
      deal.property = foundProperty;
    }

    Object.assign(deal, dealData);
    return this.dealRepository.save(deal);
  }

  async remove(id: string) {
    const deal = await this.findOne(id);
    await this.dealRepository.remove(deal);
    return { message: 'Deal deleted successfully' };
  }
}
