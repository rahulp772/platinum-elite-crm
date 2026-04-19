import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';

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

  async globalSearch(query: string) {
    if (!query) return [];

    const q = `%${query}%`;

    const properties = await this.propertyRepository.find({
      where: [
        { title: Like(q) },
        { address: Like(q) },
        { city: Like(q) },
      ],
      take: 3,
    });

    const leads = await this.leadRepository.find({
      where: [
        { name: Like(q) },
        { email: Like(q) },
        { phone: Like(q) },
      ],
      take: 3,
    });

    const deals = await this.dealRepository.find({
      where: [
        { title: Like(q) },
        { customerName: Like(q) },
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
