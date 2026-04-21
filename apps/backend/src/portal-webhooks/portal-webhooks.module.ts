import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalWebhooksService } from './portal-webhooks.service';
import { PortalWebhooksController } from './portal-webhooks.controller';
import { Lead } from '../leads/entities/lead.entity';
import { LeadActivity } from '../leads/entities/lead-activity.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, LeadActivity, User, Tenant])],
  controllers: [PortalWebhooksController],
  providers: [PortalWebhooksService],
})
export class PortalWebhooksModule {}