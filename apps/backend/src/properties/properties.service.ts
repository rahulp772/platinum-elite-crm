import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { User } from '../users/entities/user.entity';

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
    });
    return this.propertyRepository.save(property);
  }

  async findAll() {
    return this.propertyRepository.find({ relations: ['agent'] });
  }

  async findRelated(id: string, type: string, limit = 3) {
    return this.propertyRepository.find({
      where: { id: Not(id), type: type as any },
      relations: ['agent'],
      take: limit,
    });
  }

  async findOne(id: string) {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['agent'],
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.findOne(id);
    Object.assign(property, updatePropertyDto);
    return this.propertyRepository.save(property);
  }

  async remove(id: string) {
    const property = await this.findOne(id);
    await this.propertyRepository.remove(property);
    return { message: 'Property deleted successfully' };
  }

  async toggleFavorite(id: string, user: User) {
    const property = await this.propertyRepository.findOne({
      where: { id },
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
