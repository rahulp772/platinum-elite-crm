import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(user: User) {
    const where = user.isSuperAdmin ? {} : { tenantId: user.tenantId };
    return this.userRepository.find({ where });
  }

  async findOne(id: string, currentUser: User) {
    const where = currentUser.isSuperAdmin
      ? { id }
      : { id, tenantId: currentUser.tenantId };
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    const user = await this.findOne(id, currentUser);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string, currentUser: User) {
    const user = await this.findOne(id, currentUser);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}
