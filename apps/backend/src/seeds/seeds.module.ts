import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { AgentProfile } from '../users/entities/agent-profile.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Property } from '../properties/entities/property.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Task } from '../tasks/entities/task.entity';
import { Team } from '../teams/entities/team.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([
    Tenant,
    Role,
    User,
    AgentProfile,
    Lead,
    Property,
    Deal,
    Task,
    Team,
    Conversation,
    Message
  ])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedsModule {}