import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';

const DEFAULT_PLANS = [
  {
    name: 'lite',
    displayName: 'Lite',
    slug: 'lite',
    monthlyPrice: 1299,
    yearlyPrice: 12990,
    userLimit: 3,
    leadLimit: 5000,
    features: [
      'leads_management',
      'properties_management',
      'tasks_management',
      'basic_reminders',
      'mobile_responsive',
      'basic_reports',
      'whatsapp_click_to_chat',
    ],
    addOns: ['whatsapp_automation', 'ai_calling'],
    sortOrder: 0,
    recommended: false,
    tagline: 'Perfect for solo brokers',
    description: 'Everything you need to manage your deals efficiently',
    ctaText: 'Start Free Trial',
  },
  {
    name: 'team',
    displayName: 'Team',
    slug: 'team',
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    userLimit: 10,
    leadLimit: 50000,
    features: [
      'leads_management',
      'properties_management',
      'tasks_management',
      'basic_reminders',
      'mobile_responsive',
      'basic_reports',
      'whatsapp_click_to_chat',
      'team_dashboard',
      'auto_lead_assignment',
      'role_permissions',
      'facebook_integration',
      '99acres_sync',
      'magicbricks_sync',
      'whatsapp_automation',
      'ai_calling',
      'ai_lead_scoring',
    ],
    addOns: [],
    sortOrder: 1,
    recommended: true,
    tagline: 'Most popular for growing agencies',
    description: 'Scale your team with advanced automation and integrations',
    ctaText: 'Start Free Trial',
  },
  {
    name: 'scale',
    displayName: 'Scale',
    slug: 'scale',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    userLimit: -1,
    leadLimit: -1,
    features: [
      'leads_management',
      'properties_management',
      'tasks_management',
      'basic_reminders',
      'mobile_responsive',
      'basic_reports',
      'whatsapp_click_to_chat',
      'team_dashboard',
      'auto_lead_assignment',
      'role_permissions',
      'facebook_integration',
      '99acres_sync',
      'magicbricks_sync',
      'whatsapp_automation',
      'ai_calling',
      'ai_lead_scoring',
      'multi_branch',
      'custom_branding',
    ],
    addOns: [],
    sortOrder: 2,
    recommended: false,
    tagline: 'For large brokerages',
    description:
      'Unlimited power with multi-branch support and custom branding',
    ctaText: 'Contact Sales',
    ctaLink: '/contact',
    minPrice: 9999,
  },
];

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPlans();
  }

  private async seedDefaultPlans() {
    for (const planData of DEFAULT_PLANS) {
      const existing = await this.planRepository.findOne({
        where: { slug: planData.slug },
      });
      if (!existing) {
        const plan = this.planRepository.create(planData);
        await this.planRepository.save(plan);
        console.log(`[Plans] Seeded plan: ${planData.displayName}`);
      }
    }
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<Plan[]> {
    return this.planRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async findBySlug(slug: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { slug } });
    if (!plan) {
      throw new NotFoundException(`Plan with slug ${slug} not found`);
    }
    return plan;
  }

  async create(data: Partial<Plan>): Promise<Plan> {
    const plan = this.planRepository.create(data);
    return this.planRepository.save(plan);
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, data);
    return this.planRepository.save(plan);
  }

  async delete(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepository.remove(plan);
  }

  async toggleActive(id: string): Promise<Plan> {
    const plan = await this.findOne(id);
    plan.isActive = !plan.isActive;
    return this.planRepository.save(plan);
  }
}
