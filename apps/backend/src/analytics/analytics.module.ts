import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Property } from '../properties/entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Lead, Deal, User, Role])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
