import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuditService, AuditLogInput } from './audit.service';

export const AUDIT_ACTION_KEY = 'auditAction';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const AuditEnabled = this.configService.get('AUDIT_ENABLED');

    if (AuditEnabled === 'false') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const handler = context.getHandler();
    const auditAction = this.reflector.get<string>(AUDIT_ACTION_KEY, handler);

    if (!auditAction) {
      return next.handle();
    }

    const { method, url, ip, headers } = request;
    const user = request.user;
    const ipAddress = headers['x-forwarded-for'] || ip || request.ip;
    const userAgent = headers['user-agent'];

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: async () => {
          const statusCode = response.statusCode;

          if (statusCode >= 200 && statusCode < 300) {
            const input: AuditLogInput = {
              action: auditAction,
              resource: this.getResourceFromUrl(url),
              resourceId: this.getResourceIdFromUrl(url),
              ipAddress,
              userAgent,
            };

            if (user) {
              input.userId = user.id;
              input.tenantId = user.tenantId;
            }

            await this.auditService.log(input);
          }
        },
        error: async () => {
          const input: AuditLogInput = {
            action: `${auditAction}_ERROR`,
            resource: this.getResourceFromUrl(url),
            resourceId: this.getResourceIdFromUrl(url),
            ipAddress,
            userAgent,
            metadata: {
              statusCode: response.statusCode,
              method,
            },
          };

          if (user) {
            input.userId = user.id;
            input.tenantId = user.tenantId;
          }

          await this.auditService.log(input);
        },
      }),
    );
  }

  private getResourceFromUrl(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[0] || 'unknown';
  }

  private getResourceIdFromUrl(url: string): string | undefined {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : undefined;
  }
}

export function SetAuditAction(action: string) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_ACTION_KEY, action, descriptor.value);
    return descriptor;
  };
}