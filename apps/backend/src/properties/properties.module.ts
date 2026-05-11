import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { FloorPlansModule } from '../floor-plans/floor-plans.module';
import { NearbyInfrastructuresModule } from '../nearby-infrastructure/nearby-infrastructures.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    FloorPlansModule,
    NearbyInfrastructuresModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
