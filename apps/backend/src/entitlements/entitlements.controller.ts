import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EntitlementsService } from './entitlements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('entitlements')
@Controller('entitlements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EntitlementsController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get current tenant entitlements' })
  getMyEntitlements(@Request() req) {
    return this.entitlementsService.getTenantEntitlements(req.user.tenantId);
  }
}
