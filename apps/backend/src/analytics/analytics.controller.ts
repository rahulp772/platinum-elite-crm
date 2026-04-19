import { Controller, Get, UseGuards } from '@nestjs/common';
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
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get lead distribution statistics' })
  getLeadStats() {
    return this.analyticsService.getLeadStats();
  }

  @Get('properties')
  @ApiOperation({ summary: 'Get property distribution statistics' })
  getPropertyStats() {
    return this.analyticsService.getPropertyStats();
  }
}
