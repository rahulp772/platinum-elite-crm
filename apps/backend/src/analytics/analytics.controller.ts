import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get main dashboard statistics' })
  getDashboardStats(@Request() req) {
    return this.analyticsService.getDashboardStats(req.user);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get lead distribution statistics' })
  getLeadStats(@Request() req) {
    return this.analyticsService.getLeadStats(req.user);
  }

  @Get('leads/funnel')
  @ApiOperation({ summary: 'Get lead funnel statistics' })
  getLeadFunnelStats(@Request() req) {
    return this.analyticsService.getLeadFunnelStats(req.user);
  }

  @Get('properties')
  @ApiOperation({ summary: 'Get property distribution statistics' })
  getPropertyStats(@Request() req) {
    return this.analyticsService.getPropertyStats(req.user);
  }
}
