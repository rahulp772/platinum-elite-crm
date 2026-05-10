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
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { Builder } from '../builders/entities/builder.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Addon } from '../addons/entities/addon.entity';


@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      Role,
      User,
      AgentProfile,
      Lead,
      Property,
      Deal,
      Task,
      Conversation,
      Message,
      Builder,
      Subscription,
      Plan,
      Addon,
    ]),

  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedsModule {}
