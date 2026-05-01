import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLoggerService } from './services/activity-logger.service';
import { LeadActivity } from '../leads/entities/lead-activity.entity';
import { DealActivity } from '../deals/entities/deal-activity.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LeadActivity, DealActivity])],
  providers: [ActivityLoggerService],
  exports: [ActivityLoggerService],
})
export class CommonModule {}
