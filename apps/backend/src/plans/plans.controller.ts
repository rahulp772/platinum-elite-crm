import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Plan } from './entities/plan.entity';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active plans (public)' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all plans including inactive (admin)' })
  findAllAdmin() {
    return this.plansService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a specific plan by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.plansService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new plan (admin)' })
  create(@Body() data: Partial<Plan>) {
    return this.plansService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a plan (admin)' })
  update(@Param('id') id: string, @Body() data: Partial<Plan>) {
    return this.plansService.update(id, data);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle plan active status (admin)' })
  toggleActive(@Param('id') id: string) {
    return this.plansService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a plan (admin)' })
  delete(@Param('id') id: string) {
    return this.plansService.delete(id);
  }
}
