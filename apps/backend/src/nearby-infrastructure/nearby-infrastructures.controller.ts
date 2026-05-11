import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NearbyInfrastructuresService } from './nearby-infrastructures.service';
import {
  CreateNearbyInfrastructureDto,
  UpdateNearbyInfrastructureDto,
} from './dto/create-nearby-infrastructure.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('nearby-infrastructures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('nearby-infrastructures')
export class NearbyInfrastructuresController {
  constructor(private readonly niService: NearbyInfrastructuresService) {}

  @Post()
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Create a nearby infrastructure entry' })
  create(@Body() createDto: CreateNearbyInfrastructureDto, @Request() req) {
    return this.niService.create(createDto, req.user);
  }

  @Get(':id')
  @RequirePermissions('properties:read')
  @ApiOperation({ summary: 'Get a nearby infrastructure entry by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.niService.findOne(id, req.user);
  }

  @Patch(':id')
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Update a nearby infrastructure entry' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNearbyInfrastructureDto,
    @Request() req,
  ) {
    return this.niService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Delete a nearby infrastructure entry' })
  remove(@Param('id') id: string, @Request() req) {
    return this.niService.remove(id, req.user);
  }
}
