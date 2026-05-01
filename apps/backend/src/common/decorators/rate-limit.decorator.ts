import { SetMetadata } from '@nestjs/common';

export const THROTTLE_BYPASS_KEY = 'throttle_bypass';
export const ThrottleBypass = () => SetMetadata(THROTTLE_BYPASS_KEY, true);

export const RateLimitOptions = (
  ttl: number,
  limit: number,
): MethodDecorator => {
  return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata('throttle_ttl', ttl)(target, key, descriptor);
    SetMetadata('throttle_limit', limit)(target, key, descriptor);
    return descriptor;
  };
};