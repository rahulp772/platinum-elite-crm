import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeadActivity,
  LeadActivityAction,
} from '../../leads/entities/lead-activity.entity';
import {
  DealActivity,
  DealActivityAction,
} from '../../deals/entities/deal-activity.entity';

export interface ActivityLogInput {
  entityType: 'lead' | 'deal' | 'task';
  entityId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
}

@Injectable()
export class ActivityLoggerService {
  private readonly logger = new Logger(ActivityLoggerService.name);

  constructor(
    @InjectRepository(LeadActivity)
    private leadActivityRepository: Repository<LeadActivity>,
    @InjectRepository(DealActivity)
    private dealActivityRepository: Repository<DealActivity>,
  ) {}

  async logLeadActivity(input: ActivityLogInput): Promise<void> {
    const leadAction = this.mapToLeadAction(input.action);
    if (!leadAction) {
      this.logger.warn(`Unknown lead action: ${input.action}`);
      return;
    }

    const activity = this.leadActivityRepository.create({
      leadId: input.entityId,
      userId: input.userId,
      action: leadAction,
      oldValue: input.oldValue,
      newValue: input.newValue,
      description: input.description,
    });

    await this.leadActivityRepository.save(activity);
  }

  async logDealActivity(input: ActivityLogInput): Promise<void> {
    const dealAction = this.mapToDealAction(input.action);
    if (!dealAction) {
      this.logger.warn(`Unknown deal action: ${input.action}`);
      return;
    }

    const activity = this.dealActivityRepository.create({
      dealId: input.entityId,
      userId: input.userId,
      action: dealAction,
      oldValue: input.oldValue,
      newValue: input.newValue,
      description: input.description,
    });

    await this.dealActivityRepository.save(activity);
  }

  private mapToLeadAction(action: string): LeadActivityAction | null {
    const actionMap: Record<string, LeadActivityAction> = {
      created: LeadActivityAction.CREATED,
      status_changed: LeadActivityAction.STATUS_CHANGED,
      assigned: LeadActivityAction.ASSIGNED,
      reassigned: LeadActivityAction.REASSIGNED,
      note_added: LeadActivityAction.NOTE_ADDED,
      followup_scheduled: LeadActivityAction.FOLLOWUP_SCHEDULED,
      site_visit_scheduled: LeadActivityAction.SITE_VISIT_SCHEDULED,
      site_visit_done: LeadActivityAction.SITE_VISIT_DONE,
      budget_updated: LeadActivityAction.BUDGET_UPDATED,
      source_updated: LeadActivityAction.SOURCE_UPDATED,
      viewed: LeadActivityAction.VIEWED,
      re_inquiry: LeadActivityAction.RE_INQUIRY,
      outcome_logged: LeadActivityAction.OUTCOME_LOGGED,
    };
    return actionMap[action] || null;
  }

  private mapToDealAction(action: string): DealActivityAction | null {
    const actionMap: Record<string, DealActivityAction> = {
      created: DealActivityAction.CREATED,
      stage_changed: DealActivityAction.STAGE_CHANGED,
      value_updated: DealActivityAction.VALUE_UPDATED,
      priority_changed: DealActivityAction.PRIORITY_CHANGED,
      assigned: DealActivityAction.ASSIGNED,
      reassigned: DealActivityAction.REASSIGNED,
      property_linked: DealActivityAction.PROPERTY_LINKED,
      expected_close_updated: DealActivityAction.EXPECTED_CLOSE_UPDATED,
      viewed: DealActivityAction.VIEWED,
    };
    return actionMap[action] || null;
  }
}
