import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createLeadDto: CreateLeadDto, currentUser: User) {
    const { assignedToId, ...leadData } = createLeadDto;
    let assignedTo = currentUser;

    if (assignedToId) {
      const user = await this.userRepository.findOne({
        where: { id: assignedToId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
      }
      assignedTo = user;
    }

    const lead = this.leadRepository.create({
      ...leadData,
      assignedTo,
      tenantId: currentUser.tenantId,
    });
    return this.leadRepository.save(lead);
  }

  async findAll(user: User) {
    const where = user.isSuperAdmin ? {} : { tenantId: user.tenantId };
    return this.leadRepository.find({ where, relations: ['assignedTo'] });
  }

  async findOne(id: string, user: User) {
    const where = user.isSuperAdmin ? { id } : { id, tenantId: user.tenantId };
    const lead = await this.leadRepository.findOne({
      where,
      relations: ['assignedTo'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, user: User) {
    const lead = await this.findOne(id, user);
    const { assignedToId, ...leadData } = updateLeadDto;

    if (assignedToId) {
      const assignedToUser = await this.userRepository.findOne({
        where: { id: assignedToId },
      });
      if (!assignedToUser) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
      }
      lead.assignedTo = assignedToUser;
    }

    Object.assign(lead, leadData);
    return this.leadRepository.save(lead);
  }

  async remove(id: string, user: User) {
    const lead = await this.findOne(id, user);
    await this.leadRepository.remove(lead);
    return { message: 'Lead deleted successfully' };
  }
}
