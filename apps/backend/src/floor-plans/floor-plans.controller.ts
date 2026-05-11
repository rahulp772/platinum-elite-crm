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
import { FloorPlansService } from './floor-plans.service';
import {
  CreateFloorPlanDto,
  UpdateFloorPlanDto,
} from './dto/create-floor-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('floor-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('floor-plans')
export class FloorPlansController {
  constructor(private readonly floorPlansService: FloorPlansService) {}

  @Post()
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Create a floor plan' })
  create(@Body() createDto: CreateFloorPlanDto, @Request() req) {
    return this.floorPlansService.create(createDto, req.user);
  }

  @Get(':id')
  @RequirePermissions('properties:read')
  @ApiOperation({ summary: 'Get a floor plan by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.floorPlansService.findOne(id, req.user);
  }

  @Patch(':id')
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Update a floor plan' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFloorPlanDto,
    @Request() req,
  ) {
    return this.floorPlansService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Delete a floor plan' })
  remove(@Param('id') id: string, @Request() req) {
    return this.floorPlansService.remove(id, req.user);
  }
}
