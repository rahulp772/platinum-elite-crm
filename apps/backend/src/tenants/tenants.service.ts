import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findAll() {
    return this.tenantRepository.find();
  }

  async update(id: string, updateData: Partial<Tenant>, currentUser: User) {
    const tenant = await this.findOne(id);

    if (currentUser.tenantId !== id && !currentUser.isSuperAdmin) {
      throw new ForbiddenException('You can only update your own tenant');
    }

    Object.assign(tenant, updateData);
    return this.tenantRepository.save(tenant);
  }
}
