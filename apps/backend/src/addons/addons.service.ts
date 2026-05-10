import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Addon } from './entities/addon.entity';

const DEFAULT_ADDONS = [
  {
    name: 'whatsapp_automation',
    displayName: 'WhatsApp Automation',
    monthlyPrice: 999,
    features: ['whatsapp_automation', 'whatsapp_templates', 'whatsapp_scheduling'],
    description: 'Automated WhatsApp messages with templates and scheduling',
    icon: 'message-circle',
    sortOrder: 0,
  },
  {
    name: 'ai_calling',
    displayName: 'AI Calling Assistant',
    monthlyPrice: 2999,
    features: ['ai_calling', 'ai_voicemail', 'ai_call_transcription'],
    description: 'AI-powered calling with voicemail and transcription',
    icon: 'phone',
    sortOrder: 1,
  },
  {
    name: 'facebook_ads',
    displayName: 'Facebook Ads Integration',
    monthlyPrice: 499,
    features: ['facebook_lead_sync', 'facebook_ad_analytics'],
    description: 'Sync leads from Facebook/Meta ads automatically',
    icon: 'facebook',
    sortOrder: 2,
  },
  {
    name: 'website_crm',
    displayName: 'Website + CRM Package',
    monthlyPrice: 1999,
    features: ['website_builder', 'lead_capture_forms', 'landing_pages'],
    description: 'Complete website with built-in CRM lead capture',
    icon: 'globe',
    sortOrder: 3,
  },
  {
    name: 'extra_users',
    displayName: 'Extra Users',
    monthlyPrice: 299,
    features: ['extra_user_slot'],
    description: 'Add one additional user to your plan',
    icon: 'users',
    sortOrder: 4,
  },
];

@Injectable()
export class AddonsService {
  constructor(
    @InjectRepository(Addon)
    private addonRepository: Repository<Addon>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAddons();
  }

  private async seedDefaultAddons() {
    for (const addonData of DEFAULT_ADDONS) {
      const existing = await this.addonRepository.findOne({
        where: { name: addonData.name },
      });
      if (!existing) {
        const addon = this.addonRepository.create(addonData);
        await this.addonRepository.save(addon);
        console.log(`[Addons] Seeded addon: ${addonData.displayName}`);
      }
    }
  }

  async findAll(): Promise<Addon[]> {
    return this.addonRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Addon> {
    const addon = await this.addonRepository.findOne({ where: { id } });
    if (!addon) {
      throw new NotFoundException(`Addon with ID ${id} not found`);
    }
    return addon;
  }

  async findByName(name: string): Promise<Addon> {
    const addon = await this.addonRepository.findOne({ where: { name } });
    if (!addon) {
      throw new NotFoundException(`Addon with name ${name} not found`);
    }
    return addon;
  }

  async create(data: Partial<Addon>): Promise<Addon> {
    const addon = this.addonRepository.create(data);
    return this.addonRepository.save(addon);
  }

  async update(id: string, data: Partial<Addon>): Promise<Addon> {
    const addon = await this.findOne(id);
    Object.assign(addon, data);
    return this.addonRepository.save(addon);
  }

  async toggleActive(id: string): Promise<Addon> {
    const addon = await this.findOne(id);
    addon.isActive = !addon.isActive;
    return this.addonRepository.save(addon);
  }
}
