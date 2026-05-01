import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { sanitizeObject } from '../utils/sanitize.util';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (metadata.type === 'body' && typeof value === 'object') {
      return sanitizeObject(value as Record<string, unknown>);
    }

    return value;
  }
}