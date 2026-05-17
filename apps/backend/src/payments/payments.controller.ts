import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  Request,
  HttpCode,
  Req,
  Headers as NestHeaders,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import { RazorpayService } from './razorpay.service';
import { BillingCycle } from '../subscriptions/entities/subscription.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger('PaymentsWebhook');
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly razorpayService: RazorpayService,
  ) { }

  @Get('config')
  @ApiOperation({ summary: 'Get payment gateway configuration' })
  getPaymentConfig() {
    return {
      mode: this.razorpayService.getMode(),
      isTest: this.razorpayService.isTest(),
    };
  }

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Razorpay subscription for the tenant' })
  createSubscription(@Body() body: CreateSubscriptionDto, @Request() req) {
    const billingCycle = body.billingCycle === 'yearly'
      ? BillingCycle.YEARLY
      : BillingCycle.MONTHLY;

    return this.paymentsService.createSubscriptionForTenant(
      req.user.tenantId,
      body.planId,
      billingCycle,
      req.user,
    );
  }

  @Post('verify-subscription')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment and activate subscription' })
  verifySubscription(@Body() body: VerifySubscriptionDto, @Request() req) {
    console.log({ body })
    return this.paymentsService.verifyAndActivateSubscription(
      body.subscriptionId,
      body.paymentId,
      req.user.tenantId,
      req.user,
      body.signature,
    );
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel the tenant subscription' })
  cancelSubscription(@Body() body: { cancelAtCycleEnd?: boolean }, @Request() req) {
    const cancelAtCycleEnd = body?.cancelAtCycleEnd ?? true;
    return this.paymentsService.cancelSubscription(req.user.tenantId, cancelAtCycleEnd);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upgrade to a different plan' })
  upgradeSubscription(@Body() body: CreateSubscriptionDto, @Request() req) {
    const billingCycle = body.billingCycle === 'yearly'
      ? BillingCycle.YEARLY
      : BillingCycle.MONTHLY;

    return this.paymentsService.upgradeSubscription(
      req.user.tenantId,
      body.planId,
      billingCycle,
      req.user,
    );
  }

  @Post('webhooks/razorpay')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Razorpay webhook events' })
  async handleWebhook(
    @NestHeaders('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    const rawBody = JSON.stringify(body);

    if (!signature) {
      this.logger.warn('Webhook received without signature');
      return { received: true };
    }

    const isValid = this.razorpayService.verifyWebhookSignature(
      rawBody,
      signature,
    );
    if (!isValid) {
      this.logger.warn('Invalid webhook signature received');
      return { received: true };
    }

    const event = body?.event;
    const payload = body?.payload || {};

    if (event) {
      await this.paymentsService.handleWebhook(event, payload);
    }

    return { received: true };
  }
}