import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FloorPlan } from './entities/floor-plan.entity';
import { CreateFloorPlanDto, UpdateFloorPlanDto } from './dto/create-floor-plan.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FloorPlansService {
  constructor(
    @InjectRepository(FloorPlan)
    private floorPlanRepository: Repository<FloorPlan>,
  ) {}

  async create(createDto: CreateFloorPlanDto, user: User): Promise<FloorPlan> {
    const floorPlan = this.floorPlanRepository.create({
      ...createDto,
      tenantId: user.tenantId,
    });
    return this.floorPlanRepository.save(floorPlan);
  }

  async findAllByProperty(propertyId: string, user: User): Promise<FloorPlan[]> {
    return this.floorPlanRepository.find({
      where: { propertyId, tenantId: user.tenantId },
      order: { plotSize: 'ASC' },
    });
  }

  async findOne(id: string, user: User): Promise<FloorPlan> {
    const floorPlan = await this.floorPlanRepository.findOne({
      where: { id, tenantId: user.tenantId },
    });
    if (!floorPlan) {
      throw new NotFoundException(`FloorPlan with ID "${id}" not found`);
    }
    return floorPlan;
  }

  async update(id: string, updateDto: UpdateFloorPlanDto, user: User): Promise<FloorPlan> {
    const floorPlan = await this.findOne(id, user);
    Object.assign(floorPlan, updateDto);
    return this.floorPlanRepository.save(floorPlan);
  }

  async remove(id: string, user: User): Promise<void> {
    const floorPlan = await this.findOne(id, user);
    await this.floorPlanRepository.remove(floorPlan);
  }

  async createBulk(dtos: CreateFloorPlanDto[], user: User): Promise<FloorPlan[]> {
    const entities = dtos.map((dto) =>
      this.floorPlanRepository.create({ ...dto, tenantId: user.tenantId }),
    );
    return this.floorPlanRepository.save(entities);
  }
}