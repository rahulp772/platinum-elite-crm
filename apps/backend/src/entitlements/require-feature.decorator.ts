import { SetMetadata } from '@nestjs/common';
import { FEATURE_KEY } from './feature.guard';

export const RequireFeature = (feature: string) =>
  SetMetadata(FEATURE_KEY, feature);
