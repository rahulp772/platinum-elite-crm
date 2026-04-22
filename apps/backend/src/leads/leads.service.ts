import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto, LeadLookupDto } from './dto/create-lead.dto';
import { User } from '../users/entities/user.entity';
import { LeadActivity, LeadActivityAction } from './entities/lead-activity.entity';
import { LeadStatus, LeadSource } from './enums/lead.enum';
import { TeamsService } from '../teams/teams.service';

const ACTIVE_STATUSES = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.RNR,
  LeadStatus.QUALIFIED,
  LeadStatus.SITE_VISIT_SCHEDULED,
  LeadStatus.SITE_VISIT_DONE,
  LeadStatus.NEGOTIATION,
  LeadStatus.BOOKED,
];

const COOLDOWN_DAYS = 60;

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LeadActivity)
    private activityRepository: Repository<LeadActivity>,
    private teamsService: TeamsService,
  ) {}

  private async logActivity(
    leadId: string,
    userId: string,
    action: LeadActivityAction,
    oldValue?: string,
    newValue?: string,
    description?: string,
  ) {
    const activity = this.activityRepository.create({
      leadId,
      userId,
      action,
      oldValue,
      newValue,
      description,
    });
    await this.activityRepository.save(activity);
  }

  private async checkDuplicate(phone: string, tenantId: string): Promise<{ isDuplicate: boolean; existingLead?: Lead; isReInquiry?: boolean }> {
    const existingLead = await this.leadRepository.findOne({
      where: { phone, tenantId },
    });

    if (!existingLead) {
      return { isDuplicate: false };
    }

    if (ACTIVE_STATUSES.includes(existingLead.status)) {
      return { isDuplicate: true, existingLead };
    }

    if (existingLead.status === LeadStatus.LOST && existingLead.lostAt) {
      const daysSinceLost = Math.floor(
        (new Date().getTime() - new Date(existingLead.lostAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLost >= COOLDOWN_DAYS) {
        return { isDuplicate: false, existingLead, isReInquiry: true };
      }
    }

    return { isDuplicate: true, existingLead };
  }

  async create(createLeadDto: CreateLeadDto, currentUser: User) {
    const { assignedToId, followUpAt, siteVisitScheduledAt, siteVisitDoneAt, ...leadData } = createLeadDto;

    const tenantId = currentUser.tenantId;
    const checkResult = await this.checkDuplicate(createLeadDto.phone, tenantId);

    if (checkResult.isDuplicate && !checkResult.isReInquiry && checkResult.existingLead) {
      throw new BadRequestException({
        message: 'Lead with this phone number already exists',
        existingLead: {
          id: checkResult.existingLead.id,
          status: checkResult.existingLead.status,
          assignedTo: checkResult.existingLead.assignedTo?.name,
        },
      });
    }

    let assignedToIdValue = currentUser.id;
    if (assignedToId) {
      const user = await this.userRepository.findOne({
        where: { id: assignedToId, tenantId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${assignedToId} not found in your tenant`);
      }
      assignedToIdValue = user.id;
    }

    const lead = new Lead();
    Object.assign(lead, {
      ...leadData,
      assignedToId: assignedToIdValue,
      tenantId,
      followUpAt: followUpAt ? new Date(followUpAt) : null,
      siteVisitScheduledAt: siteVisitScheduledAt ? new Date(siteVisitScheduledAt) : null,
      siteVisitDoneAt: siteVisitDoneAt ? new Date(siteVisitDoneAt) : null,
    });

const savedLead = await this.leadRepository.save(lead);

    if (checkResult.isReInquiry && checkResult.existingLead) {
      await this.logActivity(
        savedLead.id,
        currentUser.id,
        LeadActivityAction.RE_INQUIRY,
        `Lost (${checkResult.existingLead.lostReason})`,
        LeadStatus.NEW,
        `Re-inquiry after ${COOLDOWN_DAYS} days`,
      );
      await this.leadRepository.update(checkResult.existingLead.id, { status: LeadStatus.NEW });
    } else {
      await this.logActivity(savedLead.id, currentUser.id, LeadActivityAction.CREATED, undefined, createLeadDto.status || LeadStatus.NEW);
    }

    return savedLead;
  }

  async findAll(user: User) {
    const { role, tenantId, isSuperAdmin } = user;
    const roleLevel = role?.level || 0;
    const currentUserId = user.id;

    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;

    if (isGlobalAdmin) {
      return this.leadRepository.find({
        relations: ['assignedTo'],
        order: { createdAt: 'DESC' },
      });
    }

    if (roleLevel >= 100) {
      return this.leadRepository.find({
        where: { tenantId },
        relations: ['assignedTo'],
        order: { createdAt: 'DESC' },
      });
    }

    if (roleLevel === 80) {
      const teamMemberIds = await this.teamsService.getTeamLeadMembers(user);
      return this.leadRepository.find({
        where: [
          { tenantId, assignedToId: currentUserId },
          { tenantId, assignedToId: In(teamMemberIds) },
        ],
        relations: ['assignedTo'],
        order: { createdAt: 'DESC' },
      });
    }

    if (roleLevel === 50) {
      const teamMemberIds = await this.teamsService.getTeamLeadMembers(user);
      return this.leadRepository.find({
        where: [
          { tenantId, assignedToId: currentUserId },
          { tenantId, assignedToId: In(teamMemberIds) },
        ],
        relations: ['assignedTo'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.leadRepository.find({
      where: { tenantId, assignedToId: currentUserId },
      relations: ['assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;
    const where = isGlobalAdmin ? { id } : { id, tenantId: user.tenantId };
    const lead = await this.leadRepository.findOne({
      where,
      relations: ['assignedTo'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    await this.logActivity(lead.id, user.id, LeadActivityAction.VIEWED);

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, user: User) {
    const lead = await this.findOne(id, user);
    const { assignedToId, followUpAt, siteVisitScheduledAt, siteVisitDoneAt, lostReason, ...leadData } = updateLeadDto;

    const oldStatus = lead.status;
    const oldBudgetMin = lead.budgetMin;
    const oldBudgetMax = lead.budgetMax;
    const oldSource = lead.source;
    const oldAssignedToId = lead.assignedToId;

    if (assignedToId && assignedToId !== lead.assignedToId) {
      const assignedToUser = await this.userRepository.findOne({
        where: { id: assignedToId, tenantId: user.tenantId },
      });
      if (!assignedToUser) {
        throw new NotFoundException(`User with ID ${assignedToId} not found in your tenant`);
      }
      lead.assignedTo = assignedToUser;
      await this.logActivity(lead.id, user.id, LeadActivityAction.ASSIGNED, lead.assignedTo?.name, assignedToUser.name);
    }

    Object.assign(lead, leadData);

    if (followUpAt) {
      lead.followUpAt = new Date(followUpAt);
    }
    if (siteVisitScheduledAt) {
      lead.siteVisitScheduledAt = new Date(siteVisitScheduledAt);
      await this.logActivity(lead.id, user.id, LeadActivityAction.SITE_VISIT_SCHEDULED, undefined, siteVisitScheduledAt);
    }
    if (siteVisitDoneAt) {
      lead.siteVisitDoneAt = new Date(siteVisitDoneAt);
      await this.logActivity(lead.id, user.id, LeadActivityAction.SITE_VISIT_DONE, undefined, siteVisitDoneAt);
    }
    if (leadData.status && leadData.status !== oldStatus) {
      await this.logActivity(lead.id, user.id, LeadActivityAction.STATUS_CHANGED, oldStatus, leadData.status);

      if (leadData.status === LeadStatus.LOST) {
        lead.lostAt = new Date();
      }
    }

    const savedLead = await this.leadRepository.save(lead);

    if (leadData.budgetMin && leadData.budgetMin !== oldBudgetMin) {
      await this.logActivity(lead.id, user.id, LeadActivityAction.BUDGET_UPDATED, String(oldBudgetMin), String(leadData.budgetMin));
    }
    if (leadData.budgetMax && leadData.budgetMax !== oldBudgetMax) {
      await this.logActivity(lead.id, user.id, LeadActivityAction.BUDGET_UPDATED, String(oldBudgetMax), String(leadData.budgetMax));
    }
    if (leadData.source && leadData.source !== oldSource) {
      await this.logActivity(lead.id, user.id, LeadActivityAction.SOURCE_UPDATED, oldSource, leadData.source);
    }

    return savedLead;
  }

  async remove(id: string, user: User) {
    const lead = await this.findOne(id, user);
    await this.leadRepository.remove(lead);
    return { message: 'Lead deleted successfully' };
  }

  async lookup(phone: string, user: User) {
    if (!user.role || user.role.level < 100) {
      throw new ForbiddenException('Only admins can lookup leads');
    }

    const lead = await this.leadRepository.findOne({
      where: { phone, tenantId: user.tenantId },
      relations: ['assignedTo'],
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return {
      status: lead.status,
      assignedTo: lead.assignedTo?.name,
    };
  }

  async getActivities(leadId: string, user: User) {
    await this.findOne(leadId, user);

    return this.activityRepository.find({
      where: { leadId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async bulkAssign(leadIds: string[], assignedToId: string, user: User) {
    if (!user.role || user.role.level < 100) {
      throw new ForbiddenException('Only admins can bulk assign leads');
    }

    const assignedToUser = await this.userRepository.findOne({
      where: { id: assignedToId, tenantId: user.tenantId },
    });
    if (!assignedToUser) {
      throw new NotFoundException(`User with ID ${assignedToId} not found in your tenant`);
    }

    const leads = await this.leadRepository.find({
      where: { id: In(leadIds), tenantId: user.tenantId },
    });

    for (const lead of leads) {
      const oldAssigned = lead.assignedToId;
      lead.assignedTo = assignedToUser;
      await this.leadRepository.save(lead);
      await this.logActivity(lead.id, user.id, LeadActivityAction.ASSIGNED, oldAssigned, assignedToId);
    }

    return { message: `${leads.length} leads assigned` };
  }

  async getMyLeads(user: User) {
    return this.leadRepository.find({
      where: { assignedToId: user.id },
      relations: ['assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUpcomingFollowUps(user: User) {
    return this.leadRepository.find({
      where: {
        assignedToId: user.id,
        followUpAt: undefined,
      },
      relations: ['assignedTo'],
      order: { followUpAt: 'ASC' },
    });
  }
}