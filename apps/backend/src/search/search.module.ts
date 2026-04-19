import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { Property } from '../properties/entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Lead, Deal])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
