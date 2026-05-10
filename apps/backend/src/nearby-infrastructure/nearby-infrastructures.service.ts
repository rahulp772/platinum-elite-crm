import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NearbyInfrastructure } from './entities/nearby-infrastructure.entity';
import { CreateNearbyInfrastructureDto, UpdateNearbyInfrastructureDto } from './dto/create-nearby-infrastructure.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NearbyInfrastructuresService {
  constructor(
    @InjectRepository(NearbyInfrastructure)
    private niRepository: Repository<NearbyInfrastructure>,
  ) {}

  async create(createDto: CreateNearbyInfrastructureDto, user: User): Promise<NearbyInfrastructure> {
    const entity = this.niRepository.create({
      ...createDto,
      tenantId: user.tenantId,
    });
    return this.niRepository.save(entity);
  }

  async findAllByProperty(propertyId: string, user: User): Promise<NearbyInfrastructure[]> {
    return this.niRepository.find({
      where: { propertyId, tenantId: user.tenantId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string, user: User): Promise<NearbyInfrastructure> {
    const entity = await this.niRepository.findOne({
      where: { id, tenantId: user.tenantId },
    });
    if (!entity) {
      throw new NotFoundException(`NearbyInfrastructure with ID "${id}" not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: UpdateNearbyInfrastructureDto, user: User): Promise<NearbyInfrastructure> {
    const entity = await this.findOne(id, user);
    Object.assign(entity, updateDto);
    return this.niRepository.save(entity);
  }

  async remove(id: string, user: User): Promise<void> {
    const entity = await this.findOne(id, user);
    await this.niRepository.remove(entity);
  }

  async createBulk(dtos: CreateNearbyInfrastructureDto[], user: User): Promise<NearbyInfrastructure[]> {
    const entities = dtos.map((dto) =>
      this.niRepository.create({ ...dto, tenantId: user.tenantId }),
    );
    return this.niRepository.save(entities);
  }
}