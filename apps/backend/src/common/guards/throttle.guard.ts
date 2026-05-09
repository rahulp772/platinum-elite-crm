import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

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

  protected async getTracker(req: Request): Promise<string> {
    const user = req.user as { id?: string } | undefined;
    if (user?.id) {
      return `user:${user.id}`;
    }
    return req.ip || 'anonymous';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldSkip = await this.shouldSkip(context);
    if (shouldSkip) {
      return true;
    }

    return super.canActivate(context);
  }
}
