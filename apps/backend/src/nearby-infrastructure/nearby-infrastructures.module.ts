import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearbyInfrastructuresService } from './nearby-infrastructures.service';
import { NearbyInfrastructuresController } from './nearby-infrastructures.controller';
import { NearbyInfrastructure } from './entities/nearby-infrastructure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NearbyInfrastructure])],
  controllers: [NearbyInfrastructuresController],
  providers: [NearbyInfrastructuresService],
  exports: [NearbyInfrastructuresService],
})
export class NearbyInfrastructuresModule {}