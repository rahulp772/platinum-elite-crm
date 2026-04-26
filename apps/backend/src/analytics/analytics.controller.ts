import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
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
  getDashboardStats(@Request() req, @Query('period') period: string) {
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

  @Get('lead-response-time')
  @ApiOperation({ summary: 'Get lead response time metrics' })
  getLeadResponseTime(@Request() req) {
    return this.analyticsService.getLeadResponseTime(req.user);
  }

  @Get('pipeline-value')
  @ApiOperation({ summary: 'Get pipeline value with weighted probability' })
  getPipelineValue(@Request() req) {
    return this.analyticsService.getPipelineValue(req.user);
  }

  @Get('team/performance')
  @ApiOperation({ summary: 'Get team performance metrics' })
  getTeamPerformance(@Request() req) {
    return this.analyticsService.getTeamPerformance(req.user);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue trend over time' })
  getRevenueTrend(@Request() req) {
    return this.analyticsService.getRevenueTrend(req.user);
  }
}
