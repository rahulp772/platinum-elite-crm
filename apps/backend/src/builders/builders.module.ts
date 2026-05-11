import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildersService } from './builders.service';
import { BuildersController } from './builders.controller';
import { Builder } from './entities/builder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Builder])],
  controllers: [BuildersController],
  providers: [BuildersService],
  exports: [BuildersService],
})
export class BuildersModule {}
