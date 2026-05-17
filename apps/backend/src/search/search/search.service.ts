import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
  ) {}

  async globalSearch(query: string, user: User) {
    if (!query) return [];

    const q = `%${query}%`;

    const properties = await this.propertyRepository.find({
      where: [
        { tenantId: user.tenantId, title: Like(q) },
        { tenantId: user.tenantId, address: Like(q) },
        { tenantId: user.tenantId, city: Like(q) },
      ],
      take: 3,
    });

    const leads = await this.leadRepository.find({
      where: [
        { tenantId: user.tenantId, name: Like(q) },
        { tenantId: user.tenantId, email: Like(q) },
        { tenantId: user.tenantId, phone: Like(q) },
      ],
      take: 3,
    });

    const deals = await this.dealRepository.find({
      where: [
        { tenantId: user.tenantId, title: Like(q) },
        { tenantId: user.tenantId, customerName: Like(q) },
      ],
      relations: ['property'],
      take: 3,
    });

    return [
      ...properties.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.address,
        type: 'property',
        status: p.status,
      })),
      ...leads.map((l) => ({
        id: l.id,
        title: l.name,
        subtitle: l.email,
        type: 'lead',
        status: l.status,
      })),
      ...deals.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: d.property?.title || 'No Property',
        type: 'deal',
        value: d.value,
      })),
    ];
  }
}
