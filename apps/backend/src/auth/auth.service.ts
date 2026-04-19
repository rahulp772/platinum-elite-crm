import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    await this.userRepository.save(user);

    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
    };
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      roleId: user.roleId,
      isSuperAdmin: user.isSuperAdmin,
    };

    if (user.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: user.roleId },
      });
      if (role) {
        (userResponse as any).permissions = role.permissions;
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, tenantId: requestedTenantId } = loginDto;

    const users = await this.userRepository.find({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'tenantId', 'roleId', 'isSuperAdmin'],
    });

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let user = users[0];

    if (users.length > 1) {
      if (!requestedTenantId) {
        const tenantList: { tenantId: string; name: string }[] = [];
        for (const u of users) {
          let name = u.name;
          if (u.tenantId) {
            const tenant = await this.tenantRepository.findOne({
              where: { id: u.tenantId },
            });
            if (tenant) {
              name = tenant.name;
            }
          }
          tenantList.push({ tenantId: u.tenantId, name });
        }
        return {
          tenants: tenantList,
          message: 'Please select a workspace',
        };
      }
      const foundUser = users.find((u) => u.tenantId === requestedTenantId);
      if (!foundUser) {
        throw new UnauthorizedException('Invalid workspace for this user');
      }
      user = foundUser;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
    };
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      roleId: user.roleId,
      isSuperAdmin: user.isSuperAdmin,
    };

    if (user.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: user.roleId },
      });
      if (role) {
        (userResponse as any).permissions = role.permissions;
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }
}
