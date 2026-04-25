import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { DealActivity, DealActivityAction } from './entities/deal-activity.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { DealStage, DealPriority } from './enums/deal.enum';

const ACTIVE_STAGES = [DealStage.LEAD, DealStage.NEGOTIATION, DealStage.UNDER_CONTRACT];

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(DealActivity)
    private activityRepository: Repository<DealActivity>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  private async logActivity(
    dealId: string,
    userId: string,
    action: DealActivityAction,
    oldValue?: string,
    newValue?: string,
    description?: string,
  ) {
    const activity = this.activityRepository.create({
      dealId,
      userId,
      action,
      oldValue,
      newValue,
      description,
    });
    await this.activityRepository.save(activity);
  }

  async create(createDealDto: CreateDealDto, user: User) {
    const { propertyId, ...dealData } = createDealDto;
    let property: Property | null = null;

    if (propertyId) {
      const foundProperty = await this.propertyRepository.findOne({
        where: { id: propertyId, tenantId: user.tenantId },
      });
      if (!foundProperty) {
        throw new NotFoundException(`Property with ID ${propertyId} not found in your tenant`);
      }
      property = foundProperty;
    }

    const deal = this.dealRepository.create({
      ...dealData,
      agent: user,
      property,
      tenantId: user.tenantId,
    });
    const savedDeal = await this.dealRepository.save(deal);
    
    await this.logActivity(
      savedDeal.id,
      user.id,
      DealActivityAction.CREATED,
      undefined,
      dealData.stage || DealStage.LEAD,
    );

    return savedDeal;
  }

  async findAll(user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;
    const where = isGlobalAdmin ? {} : { tenantId: user.tenantId };
    return this.dealRepository.find({
      where,
      relations: ['agent', 'property'],
    });
  }

  async findOne(id: string, user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;
    const where = isGlobalAdmin ? { id } : { id, tenantId: user.tenantId };
    const deal = await this.dealRepository.findOne({
      where,
      relations: ['agent', 'property'],
    });
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    await this.logActivity(deal.id, user.id, DealActivityAction.VIEWED);

    return deal;
  }

  async update(id: string, updateDealDto: UpdateDealDto, user: User) {
    const deal = await this.findOne(id, user);
    const { propertyId, ...dealData } = updateDealDto;

    const oldStage = deal.stage;
    const oldValue = deal.value;
    const oldPriority = deal.priority;
    const oldExpectedClose = deal.expectedCloseDate;
    const oldPropertyId = deal.property?.id;

    if (propertyId) {
      const foundProperty = await this.propertyRepository.findOne({
        where: { id: propertyId, tenantId: user.tenantId },
      });
      if (!foundProperty) {
        throw new NotFoundException(`Property with ID ${propertyId} not found in your tenant`);
      }
      
      if (propertyId !== oldPropertyId) {
        await this.logActivity(
          deal.id,
          user.id,
          DealActivityAction.PROPERTY_LINKED,
          oldPropertyId,
          propertyId,
        );
      }
      deal.property = foundProperty;
    }

    Object.assign(deal, dealData);
    const savedDeal = await this.dealRepository.save(deal);

    if (dealData.stage && dealData.stage !== oldStage) {
      await this.logActivity(
        deal.id,
        user.id,
        DealActivityAction.STAGE_CHANGED,
        oldStage,
        dealData.stage,
      );
    }

    if (dealData.value && dealData.value !== oldValue) {
      await this.logActivity(
        deal.id,
        user.id,
        DealActivityAction.VALUE_UPDATED,
        String(oldValue),
        String(dealData.value),
      );
    }

    if (dealData.priority && dealData.priority !== oldPriority) {
      await this.logActivity(
        deal.id,
        user.id,
        DealActivityAction.PRIORITY_CHANGED,
        oldPriority,
        dealData.priority,
      );
    }

    if (dealData.expectedCloseDate && oldExpectedClose !== dealData.expectedCloseDate) {
      await this.logActivity(
        deal.id,
        user.id,
        DealActivityAction.EXPECTED_CLOSE_UPDATED,
        oldExpectedClose ? String(oldExpectedClose) : undefined,
        String(dealData.expectedCloseDate),
      );
    }

    return savedDeal;
  }

  async remove(id: string, user: User) {
    const deal = await this.findOne(id, user);
    await this.dealRepository.remove(deal);
    return { message: 'Deal deleted successfully' };
  }

  async getActivities(dealId: string, user: User) {
    await this.findOne(dealId, user);

    return this.activityRepository.find({
      where: { dealId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async reassign(dealId: string, assignedToId: string, user: User) {
    if (!user.role || user.role.level < 80) {
      throw new ForbiddenException('Only managers and admins can reassign deals');
    }

    const deal = await this.findOne(dealId, user);
    const oldAgentId = deal.agent.id;

    const newAgent = await this.propertyRepository.manager.findOne(User, { where: { id: assignedToId, tenantId: user.tenantId } });
    if (!newAgent) {
      throw new NotFoundException(`User with ID ${assignedToId} not found in your tenant`);
    }

    deal.agent = newAgent;
    await this.dealRepository.save(deal);
    await this.logActivity(
      deal.id,
      user.id,
      DealActivityAction.REASSIGNED,
      oldAgentId,
      assignedToId,
    );

    return { message: 'Deal reassigned successfully' };
  }
}
