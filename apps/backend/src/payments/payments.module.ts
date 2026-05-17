import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RazorpayService } from './razorpay.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, Subscription, Plan]),
    ConfigModule,
    TransactionsModule,
    SubscriptionsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayService],
  exports: [PaymentsService, RazorpayService],
})
export class PaymentsModule {}
