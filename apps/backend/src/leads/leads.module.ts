import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead } from './entities/lead.entity';
import { LeadActivity } from './entities/lead-activity.entity';
import { User } from '../users/entities/user.entity';
import { AgentProfile } from '../users/entities/agent-profile.entity';
import { LeadScoringService } from './services/lead-scoring.service';
import { LeadAssignmentService } from './services/lead-assignment.service';
import { LeadAiEngineService } from './services/lead-ai-engine.service';
import { LeadSlaCron } from './cron/lead-sla.cron';

import { LeadsImportController } from './import/leads-import.controller';
import { LeadsImportService } from './import/leads-import.service';
import { ImportSession } from './import/entities/import-session.entity';
import { StorageService } from '../common/storage.service';
import { LeadsImportProcessor } from '../common/queue/leads-import.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      LeadActivity,
      User,
      AgentProfile,
      ImportSession,
    ]),
    BullModule.registerQueue({
      name: 'leads-import',
    }),
  ],
  controllers: [LeadsController, LeadsImportController],
  providers: [
    LeadsService,
    LeadsImportService,
    LeadScoringService,
    LeadAssignmentService,
    LeadAiEngineService,
    LeadSlaCron,
    StorageService,
    LeadsImportProcessor,
  ],
  exports: [
    LeadsService,
    LeadScoringService,
    LeadAssignmentService,
    LeadAiEngineService,
    LeadsImportService,
  ],
})
export class LeadsModule {}
