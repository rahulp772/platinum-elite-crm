import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitlementsService } from './entitlements.service';
import { EntitlementsController } from './entitlements.controller';
import { UserLimitGuard } from './user-limit.guard';
import { FeatureGuard } from './feature.guard';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Tenant, User, Lead, Plan])],
  controllers: [EntitlementsController],
  providers: [EntitlementsService, UserLimitGuard, FeatureGuard],
  exports: [EntitlementsService, UserLimitGuard, FeatureGuard],
})
export class EntitlementsModule {}
