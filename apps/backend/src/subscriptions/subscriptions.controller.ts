import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { BillingCycle } from './entities/subscription.entity';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get current tenant subscription' })
  getMySubscription(@Request() req) {
    return this.subscriptionsService.findByTenant(req.user.tenantId);
  }

  @Post('subscribe')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Subscribe to a plan' })
  subscribe(
    @Body()
    body: { planId: string; billingCycle?: BillingCycle; addOns?: string[] },
    @Request() req,
  ) {
    return this.subscriptionsService.createSubscription({
      tenantId: req.user.tenantId,
      planId: body.planId,
      billingCycle: body.billingCycle,
      addOns: body.addOns,
      currentUser: req.user,
    });
  }

  @Post('upgrade')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Upgrade to a different plan' })
  upgrade(@Body() body: { planId: string }, @Request() req) {
    return this.subscriptionsService.upgrade(
      req.user.tenantId,
      body.planId,
      req.user,
    );
  }

  @Post('cancel')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@Request() req) {
    return this.subscriptionsService.cancel(req.user.tenantId, req.user);
  }

  @Post('addons/add')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Add an add-on' })
  addAddOn(@Body() body: { addOnName: string }, @Request() req) {
    return this.subscriptionsService.addAddOn(
      req.user.tenantId,
      body.addOnName,
      req.user,
    );
  }

  @Post('addons/remove')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Remove an add-on' })
  removeAddOn(@Body() body: { addOnName: string }, @Request() req) {
    return this.subscriptionsService.removeAddOn(
      req.user.tenantId,
      body.addOnName,
      req.user,
    );
  }

  @Post(':tenantId/assign-random')
  @ApiOperation({ summary: 'Assign random plan to tenant (admin)' })
  assignRandomPlan(@Param('tenantId') tenantId: string, @Request() req) {
    return this.subscriptionsService.assignRandomPlanToTenant(tenantId);
  }
}
