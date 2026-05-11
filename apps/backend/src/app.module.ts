import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomThrottlerGuard } from './common/guards/throttle.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { TenantsModule } from './tenants/tenants.module';
import { PropertiesModule } from './properties/properties.module';
import { LeadsModule } from './leads/leads.module';
import { DealsModule } from './deals/deals.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { SeedsModule } from './seeds/seeds.module';
import { PortalWebhooksModule } from './portal-webhooks/portal-webhooks.module';
import { AuditModule } from './audit/audit.module';
import { BuildersModule } from './builders/builders.module';
import { PlansModule } from './plans/plans.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FloorPlansModule } from './floor-plans/floor-plans.module';
import { NearbyInfrastructuresModule } from './nearby-infrastructure/nearby-infrastructures.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AddonsModule } from './addons/addons.module';
import { EntitlementsModule } from './entitlements/entitlements.module';


@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('THROTTLE_TTL', 60000);
        const limit = configService.get<number>('THROTTLE_LIMIT', 100);
        console.log(`[Throttler] TTL: ${ttl}, LIMIT: ${limit}`);
        return {
          throttlers: [
            {
              name: 'default',
              ttl: 60000,
              limit: 2000,
            },
            {
              name: 'short',
              ttl: 1000,
              limit: 100,
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
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
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        timezone: 'UTC',
      }),
      inject: [ConfigService],
    }),
    AuditModule,
    SeedsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    TenantsModule,
    PropertiesModule,
    LeadsModule,
    DealsModule,
    TasksModule,
    ChatModule,
    AnalyticsModule,
    SearchModule,
    PortalWebhooksModule,
    BuildersModule,
    PlansModule,
    TransactionsModule,
    FloorPlansModule,
    NearbyInfrastructuresModule,
    SubscriptionsModule,
    AddonsModule,
    EntitlementsModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
