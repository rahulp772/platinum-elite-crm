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
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuditService } from '../audit/audit.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private rolesService: RolesService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, tenantName } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const tenant = this.tenantRepository.create({
      name: tenantName || 'My Company',
      isTrial: true,
      trialStartDate,
      trialEndDate,
      isActive: true,
      timezone: 'Asia/Kolkata',
    });
    await this.tenantRepository.save(tenant);

    const seededRoles = await this.rolesService.seedDefaultRoles(tenant.id);
    const adminRole = seededRoles.find((r) => r.name === 'Admin');

    if (!adminRole) {
      throw new Error('Default roles failed to seed');
    }

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name: '',
      tenantId: tenant.id,
      roleId: adminRole.id,
      timezone: 'Asia/Kolkata',
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
      isOnboardingComplete: user.isOnboardingComplete,
    };

    if (user.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: user.roleId },
      });
      if (role) {
        (userResponse as any).permissions = role.permissions;
        (userResponse as any).role = {
          id: role.id,
          name: role.name,
          level: role.level,
        };
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
        'avatar',
        'tenantId',
        'roleId',
        'isSuperAdmin',
        'timezone',
        'failedLoginAttempts',
        'lockedUntil',
        'isOnboardingComplete',
        'phone',
        'whatsapp',
        'officeAddress',
      ],
    });

    if (!users || users.length === 0) {
      await this.auditService.logLoginFailed(
        email,
        ipAddress,
        userAgent,
        'User not found',
      );
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
        await this.auditService.logLoginFailed(
          email,
          ipAddress,
          userAgent,
          'Invalid workspace',
        );
        throw new UnauthorizedException('Invalid workspace for this user');
      }
      user = foundUser;
    }

    const maxAttempts = this.configService.get('MAX_LOGIN_ATTEMPTS') || 5;
    const lockoutDuration =
      this.configService.get('LOCKOUT_DURATION_MINUTES') || 15;

    if (user.failedLoginAttempts >= maxAttempts && user.lockedUntil) {
      const lockUntil = new Date(user.lockedUntil);
      if (lockUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (lockUntil.getTime() - Date.now()) / 60000,
        );
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

      await this.auditService.logLoginFailed(
        email,
        ipAddress,
        userAgent,
        reason,
      );

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
      avatar: (user as any).avatar || '',
      tenantId: user.tenantId,
      roleId: user.roleId,
      isSuperAdmin: user.isSuperAdmin,
      timezone: user.timezone,
      isOnboardingComplete: (user as any).isOnboardingComplete || false,
      phone: (user as any).phone || '',
      whatsapp: (user as any).whatsapp || '',
      officeAddress: (user as any).officeAddress || '',
    };

    if (user.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: user.roleId },
      });
      if (role) {
        (userResponse as any).permissions = role.permissions;
        (userResponse as any).role = {
          id: role.id,
          name: role.name,
          level: role.level,
        };
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user || !user.tenantId) {
      return { status: 'inactive' };
    }

    const tenant = user.tenant;
    const now = new Date();
    let isTrialExpired = false;
    let daysSinceExpiry = 0;

    if (tenant.isTrial && tenant.trialEndDate) {
      const trialEnd = new Date(tenant.trialEndDate);
      if (now > trialEnd) {
        isTrialExpired = true;
        daysSinceExpiry = Math.floor(
          (now.getTime() - trialEnd.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
    }

    const planTierMap: Record<string, number> = {
      starter: 0,
      professional: 1,
      enterprise: 2,
      lite: 0,
      team: 1,
      scale: 2,
    };
    const planNameLower = tenant.planName?.toLowerCase() || '';
    const planTier = planTierMap[planNameLower] ?? -1;

    // Check actual subscription in database
    const subscription = await this.subscriptionRepository.findOne({
      where: { tenantId: tenant.id },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });

    // Determine if user has an active subscription
    const hasActiveSubscription =
      subscription &&
      [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL].includes(subscription.status);

    // isOnHighestPlan only if there's an active subscription on the highest tier
    const isOnHighestPlan = hasActiveSubscription && planTier === 2;

    // Use plan from subscription if available, otherwise fall back to tenant planName
    const displayPlanName =
      subscription?.plan?.displayName || tenant.planName || null;

    return {
      isTrial: tenant.isTrial,
      isTrialExpired,
      daysSinceExpiry,
      trialEndDate: tenant.trialEndDate,
      planName: displayPlanName,
      subscriptionStatus: subscription?.status || tenant.subscriptionStatus,
      subscriptionStartDate:
        subscription?.currentPeriodStart || tenant.subscriptionStartDate,
      subscriptionEndDate:
        subscription?.currentPeriodEnd || tenant.subscriptionEndDate,
      planTier,
      billingCycle: subscription?.billingCycle || null,
      isOnHighestPlan,
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id || null,
    };
  }
}
