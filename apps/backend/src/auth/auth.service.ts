import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuditService } from '../audit/audit.service';

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
    private configService: ConfigService,
    private auditService: AuditService,
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
      timezone: user.timezone,
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

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password, tenantId: requestedTenantId } = loginDto;

    const users = await this.userRepository.find({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'name',
        'tenantId',
        'roleId',
        'isSuperAdmin',
        'timezone',
        'failedLoginAttempts',
        'lockedUntil',
      ],
    });

    if (!users || users.length === 0) {
      await this.auditService.logLoginFailed(email, ipAddress, userAgent, 'User not found');
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
        await this.auditService.logLoginFailed(email, ipAddress, userAgent, 'Invalid workspace');
        throw new UnauthorizedException('Invalid workspace for this user');
      }
      user = foundUser;
    }

    const maxAttempts = this.configService.get('MAX_LOGIN_ATTEMPTS') || 5;
    const lockoutDuration = this.configService.get('LOCKOUT_DURATION_MINUTES') || 15;

    if (user.failedLoginAttempts >= maxAttempts && user.lockedUntil) {
      const lockUntil = new Date(user.lockedUntil);
      if (lockUntil > new Date()) {
        const remainingMinutes = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
        await this.auditService.logLoginFailed(
          email,
          ipAddress,
          userAgent,
          `Account locked until ${lockUntil.toISOString()}`,
        );
        throw new UnauthorizedException(
          `Account temporarily locked. Try again in ${remainingMinutes} minutes.`,
        );
      } else {
        await this.userRepository.update(user.id, {
          failedLoginAttempts: 0,
          lockedUntil: undefined,
        });
      }
    }

    if (!(await bcrypt.compare(password, user.password))) {
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockedUntil: Date | undefined = undefined;

      if (newAttempts >= maxAttempts) {
        const lockDate = new Date();
        lockDate.setMinutes(lockDate.getMinutes() + lockoutDuration);
        lockedUntil = lockDate;
      }

      await this.userRepository.update(user.id, {
        failedLoginAttempts: newAttempts,
        lockedUntil,
      });

      const reason =
        newAttempts >= maxAttempts
          ? `Account locked after ${maxAttempts} failed attempts`
          : `Invalid password (attempt ${newAttempts}/${maxAttempts})`;

      await this.auditService.logLoginFailed(email, ipAddress, userAgent, reason);

      if (newAttempts >= maxAttempts) {
        throw new UnauthorizedException(
          `Too many failed attempts. Account locked for ${lockoutDuration} minutes.`,
        );
      }

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: new Date(),
      passwordChangedAt: new Date(),
    });

    await this.auditService.logLoginSuccess(user, ipAddress, userAgent);

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
      timezone: user.timezone,
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