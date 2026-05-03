import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBuilderDto, UpdateBuilderDto } from './dto/create-builder.dto';
import { Builder } from './entities/builder.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BuildersService {
  constructor(
    @InjectRepository(Builder)
    private readonly builderRepository: Repository<Builder>,
  ) { }

  async create(createBuilderDto: CreateBuilderDto, user: User): Promise<Builder> {
    const builder = this.builderRepository.create({
      ...createBuilderDto,
      tenantId: user.tenantId,
    });
    return await this.builderRepository.save(builder);
  }

  async findAll(user: User): Promise<Builder[]> {
    return await this.builderRepository.find({
      where: { tenantId: user.tenantId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, user: User): Promise<Builder> {
    const builder = await this.builderRepository.findOne({
      where: { id, tenantId: user.tenantId },
      relations: ['properties'],
    });

    if (!builder) {
      throw new NotFoundException(`Builder with ID "${id}" not found`);
    }

    return builder;
  }

  async update(
    id: string,
    updateBuilderDto: UpdateBuilderDto,
    user: User,
  ): Promise<Builder> {
    const builder = await this.findOne(id, user);
    Object.assign(builder, updateBuilderDto);
    return await this.builderRepository.save(builder);
  }

  async remove(id: string, user: User): Promise<void> {
    const builder = await this.findOne(id, user);
    await this.builderRepository.remove(builder);
  }
}
