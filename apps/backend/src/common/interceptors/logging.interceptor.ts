import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const method = request.method;
    const url = request.url;
    const body = request.body as Record<string, unknown>;
    const headers = request.headers as Record<string, string | undefined>;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    this.logger.log(
      `→ ${method} ${url} ${userAgent} - Body: ${JSON.stringify(this.sanitizeBody(body))}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(`← ${method} ${url} ${statusCode} - ${duration}ms`);
        },
        error: (error: { status?: number; message?: string }) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          const message = error.message || 'Unknown error';
          this.logger.error(
            `✕ ${method} ${url} ${statusCode} - ${duration}ms - ${message}`,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      body as Record<string, unknown>,
    )) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = '[OBJECT]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
