import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonsService } from './addons.service';
import { Addon } from './entities/addon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Addon])],
  providers: [AddonsService],
  exports: [AddonsService],
})
export class AddonsModule {}
