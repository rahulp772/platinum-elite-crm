import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidationArguments } from 'class-validator';

export const HTML_TAGS_REGEX = /<[^>]*>/g;
export const SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i;

export function IsSanitized(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSanitized',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return true;
          }

          const hasHtmlTags = HTML_TAGS_REGEX.test(value);
          const hasSqlKeywords = SQL_INJECTION_PATTERN.test(value);

          return !hasHtmlTags && !hasSqlKeywords;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains potentially dangerous content`;
        },
      },
    });
  };
}

export function sanitizeString(value: string): string {
  if (!value) return '';

  let sanitized = value
    .replace(HTML_TAGS_REGEX, '')
    .replace(/['"]/g, '')
    .trim();

  return sanitized;
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : item,
      );
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}