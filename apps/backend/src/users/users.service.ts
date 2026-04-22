import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) { }

  async findAll(user: User, tenantId?: string) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;

    if (isGlobalAdmin) {
      const where = tenantId ? { tenantId } : {};
      return this.userRepository.find({ where, relations: ['role'] });
    }

    const currentLevel = user.role?.level || 0;
    const effectiveTenantId = user.tenantId;

    // Admins (level 100+) can see everyone in their tenant
    if (currentLevel >= 100) {
      return this.userRepository.find({
        where: { tenantId: effectiveTenantId },
        relations: ['role'],
      });
    }

    // Others can see users with level < currentLevel in their tenant, plus themselves
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.tenantId = :tenantId', { tenantId: effectiveTenantId })
      .andWhere('(role.level < :level OR user.id = :userId)', {
        level: currentLevel,
        userId: user.id,
      })
      .getMany();
  }

  async findOne(id: string, currentUser: User) {
    const isGlobalAdmin = currentUser.isSuperAdmin && !currentUser.tenantId;
    const where = isGlobalAdmin
      ? { id }
      : { id, tenantId: currentUser.tenantId };
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto & { roleId?: string },
    currentUser: User,
  ) {
    const user = await this.findOne(id, currentUser);
    const { roleId, ...rest } = updateUserDto;
    if (roleId !== undefined) {
      (user as any).roleId = roleId || undefined;
    }
    Object.assign(user, rest);
    return this.userRepository.save(user);
  }

  async remove(id: string, currentUser: User) {
    const user = await this.findOne(id, currentUser);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async invite(inviteDto: InviteUserDto, currentUser: User) {
    const { email, name, roleId, phone } = inviteDto;

    const existingUser = await this.userRepository.findOne({
      where: { email, tenantId: currentUser.tenantId },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists in this workspace');
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      roleId,
      phone,
      tenantId: currentUser.tenantId,
    });

    await this.userRepository.save(newUser);

    const loginLink = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/login`;
    const emailSent = await this.sendInviteEmail(
      email,
      tempPassword,
      loginLink,
    );

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        roleId: newUser.roleId,
        tenantId: newUser.tenantId,
      },
      message: 'User invited successfully',
      ...(emailSent ? {} : { tempPassword, loginLink }),
    };
  }

  private sendInviteEmail(
    email: string,
    tempPassword: string,
    loginLink: string,
  ): boolean {
    const useRealEmail = this.configService.get('SEND_REAL_EMAILS') === 'true';

    if (useRealEmail) {
      console.log(`[EMAIL SENT] To: ${email}`);
      console.log(`[EMAIL SENT] Temporary Password: ${tempPassword}`);
      console.log(`[EMAIL SENT] Login Link: ${loginLink}`);
      return true;
    }

    console.log(`[SIMULATED EMAIL] To: ${email}`);
    console.log(`[SIMULATED EMAIL] Temporary Password: ${tempPassword}`);
    console.log(`[SIMULATED EMAIL] Login Link: ${loginLink}`);
    return false;
  }
}
