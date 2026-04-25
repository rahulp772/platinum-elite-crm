import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository, IsNull } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadStatus } from '../enums/lead.enum';
import { LeadAssignmentService } from '../services/lead-assignment.service';

@Injectable()
export class LeadSlaCron {
  private readonly logger = new Logger(LeadSlaCron.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    private readonly leadAssignmentService: LeadAssignmentService,
    // Add Gateway/WebSocket injection here later
  ) {}

  /**
   * Runs every minute to check for SLA breaches on new leads (5-min rule)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleNewLeadSla() {
    this.logger.debug('Checking for 5-minute SLA breaches on NEW leads...');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const breachedLeads = await this.leadRepository.find({
      where: {
        status: LeadStatus.NEW,
        createdAt: LessThan(fiveMinutesAgo),
        slaBreachedAt: IsNull(),
      },
    });

    for (const lead of breachedLeads) {
      this.logger.warn(`Lead ${lead.id} breached 5-min SLA. Reassigning...`);

      // Record breach
      lead.slaBreachedAt = new Date();
      
      // Reassign
      const newAgentId = await this.leadAssignmentService.assignAgent(lead);
      if (newAgentId && newAgentId !== lead.assignedToId) {
        lead.assignedToId = newAgentId;
        this.logger.log(`Reassigned lead ${lead.id} to agent ${newAgentId}`);
      }

      await this.leadRepository.save(lead);
      
      // TODO: Emit WebSocket event to Manager/Team Lead regarding breach
    }
  }

  /**
   * Runs every 15 minutes to check for missed follow-ups
   */
  @Cron('0 */15 * * * *')
  async handleMissedFollowUps() {
    this.logger.debug('Checking for missed follow-ups...');
    
    const now = new Date();
    const missedFollowUps = await this.leadRepository.find({
      where: {
        followUpAt: LessThan(now),
      },
      relations: ['assignedTo']
    });

    for (const lead of missedFollowUps) {
      // In a real app, we'd want to track if we already alerted about this specific follow-up
      this.logger.warn(`Lead ${lead.id} has a missed follow-up from ${lead.followUpAt}`);
      
      // TODO: Emit WebSocket event to Agent & Team Lead
    }
  }
}
