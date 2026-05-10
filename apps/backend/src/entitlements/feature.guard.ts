import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementsService } from './entitlements.service';

export const FEATURE_KEY = 'feature';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private entitlementsService: EntitlementsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(
      FEATURE_KEY,
      context.getHandler(),
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      return true;
    }

    const entitlements = await this.entitlementsService.getTenantEntitlements(user.tenantId);

    if (!entitlements) {
      throw new ForbiddenException({
        message: 'No active subscription found',
        code: 'NO_SUBSCRIPTION',
        upgradeUrl: '/settings/billing',
      });
    }

    if (!this.entitlementsService.hasFeature(entitlements, requiredFeature)) {
      throw new ForbiddenException({
        message: `This feature is not available in your ${entitlements.planName} plan`,
        code: 'FEATURE_NOT_AVAILABLE',
        requiredFeature,
        planName: entitlements.planName,
        upgradeUrl: '/settings/billing',
      });
    }

    return true;
  }
}
