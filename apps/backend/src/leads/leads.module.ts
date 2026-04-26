import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead } from './entities/lead.entity';
import { LeadActivity } from './entities/lead-activity.entity';
import { User } from '../users/entities/user.entity';
import { AgentProfile } from '../users/entities/agent-profile.entity';
import { TeamsModule } from '../teams/teams.module';
import { LeadScoringService } from './services/lead-scoring.service';
import { LeadAssignmentService } from './services/lead-assignment.service';
import { LeadAiEngineService } from './services/lead-ai-engine.service';
import { LeadSlaCron } from './cron/lead-sla.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, LeadActivity, User, AgentProfile]),
    TeamsModule,
  ],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadScoringService,
    LeadAssignmentService,
    LeadAiEngineService,
    LeadSlaCron
  ],
  exports: [
    LeadsService,
    LeadScoringService,
    LeadAssignmentService,
    LeadAiEngineService
  ],
})
export class LeadsModule {}