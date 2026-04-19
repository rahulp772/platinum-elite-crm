import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(user: { tenantId: string; isSuperAdmin: boolean }) {
    const where = user.isSuperAdmin && user.tenantId 
      ? { tenantId: user.tenantId } 
      : user.isSuperAdmin 
        ? {} 
        : { tenantId: user.tenantId };
    return this.roleRepository.find({ where });
  }

  async findOne(id: string, currentUser: { tenantId: string; isSuperAdmin: boolean }) {
    const where = currentUser.isSuperAdmin
      ? { id }
      : { id, tenantId: currentUser.tenantId };
    const role = await this.roleRepository.findOne({ where });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto, currentUser: { tenantId: string }) {
    const { name, description, permissions } = createRoleDto;

    const role = this.roleRepository.create({
      name,
      description,
      permissions,
      tenantId: currentUser.tenantId,
      isSystem: false,
    });

    return this.roleRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, currentUser: { tenantId: string; isSuperAdmin: boolean }) {
    const role = await this.findOne(id, currentUser);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: string, currentUser: { tenantId: string; isSuperAdmin: boolean }) {
    const role = await this.findOne(id, currentUser);

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    await this.roleRepository.remove(role);
    return { message: 'Role deleted successfully' };
  }
}