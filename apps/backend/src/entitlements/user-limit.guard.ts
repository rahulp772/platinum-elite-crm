import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementsService } from './entitlements.service';

export const USER_LIMIT_KEY = 'user_limit';
export const LEAD_LIMIT_KEY = 'lead_limit';

@Injectable()
export class UserLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private entitlementsService: EntitlementsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      return true;
    }

    const result = await this.entitlementsService.canAddUser(user.tenantId);

    if (!result.allowed) {
      throw new ForbiddenException({
        message: result.message,
        code: 'USER_LIMIT_REACHED',
        upgradeUrl: '/settings/billing',
      });
    }

    return true;
  }
}
