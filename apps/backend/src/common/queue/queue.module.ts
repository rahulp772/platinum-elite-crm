import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsImportProcessor } from './leads-import.processor';
import { LeadsImportService } from '../../leads/import/leads-import.service';
import { ImportSession } from '../../leads/import/entities/import-session.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { StorageService } from '../storage.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'leads-import',
    }),
    TypeOrmModule.forFeature([ImportSession, Lead]),
  ],
  providers: [LeadsImportProcessor, LeadsImportService, StorageService],
  exports: [BullModule],
})
export class QueueModule {}
