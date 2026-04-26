import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortalWebhooksService } from './portal-webhooks.service';

interface PortalPayload {
  name?: string;
  email?: string;
  phone?: string;
  budget?: string | number;
  location?: string;
  property_type?: string;
  custom_fields?: Record<string, unknown>;
}

type EnrichedPayload = {
  name?: string;
  email?: string;
  phone?: string;
  budget?: string | number | undefined;
  location?: string;
  propertyType?: string;
};

@ApiTags('portal-webhooks')
@Controller('webhooks')
export class PortalWebhooksController {
  constructor(private readonly portalWebhooksService: PortalWebhooksService) {}

  @Post('99acres')
  @ApiOperation({ summary: 'Webhook for 99acres leads' })
  async process99acres(
    @Body() payload: PortalPayload,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing tenant ID header');
    }

    const enrichedPayload: EnrichedPayload = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      budget: typeof payload.budget === 'number' ? payload.budget : (payload.budget as string | number | undefined),
      location: payload.location || (payload.custom_fields?.['location'] as string | undefined),
      propertyType: payload.property_type || (payload.custom_fields?.['property_type'] as string | undefined),
    };

    const lead = await this.portalWebhooksService.process99acres(enrichedPayload, tenantId);
    return { success: true, leadId: lead.id };
  }

  @Post('magicbricks')
  @ApiOperation({ summary: 'Webhook for MagicBricks leads' })
  async processMagicBricks(
    @Body() payload: PortalPayload,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing tenant ID header');
    }

    const enrichedPayload: EnrichedPayload = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      budget: typeof payload.budget === 'number' ? payload.budget : (payload.budget as string | number | undefined),
      location: payload.location || (payload.custom_fields?.['location'] as string | undefined),
      propertyType: payload.property_type || (payload.custom_fields?.['property_type'] as string | undefined),
    };

    const lead = await this.portalWebhooksService.processMagicBricks(enrichedPayload, tenantId);
    return { success: true, leadId: lead.id };
  }

  @Post('housing')
  @ApiOperation({ summary: 'Webhook for Housing.com leads' })
  async processHousing(
    @Body() payload: PortalPayload,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing tenant ID header');
    }

    const enrichedPayload: EnrichedPayload = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      budget: typeof payload.budget === 'number' ? payload.budget : (payload.budget as string | number | undefined),
      location: payload.location || (payload.custom_fields?.['location'] as string | undefined),
      propertyType: payload.property_type || (payload.custom_fields?.['property_type'] as string | undefined),
    };

    const lead = await this.portalWebhooksService.processHousing(enrichedPayload, tenantId);
    return { success: true, leadId: lead.id };
  }
}