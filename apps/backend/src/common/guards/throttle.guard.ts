import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.isSuperAdmin) {
      return true;
    }

    return false;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldSkip = await this.shouldSkip(context);
    if (shouldSkip) {
      return true;
    }

    return super.canActivate(context);
  }
}
