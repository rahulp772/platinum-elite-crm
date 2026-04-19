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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('users:read')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all roles' })
  findAll(@Request() req) {
    return this.rolesService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.rolesService.findOne(id, req.user);
  }

  @Post()
  @RequirePermissions('roles:write')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    return this.rolesService.create(createRoleDto, req.user);
  }

  @Patch(':id')
  @RequirePermissions('roles:write')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Request() req) {
    return this.rolesService.update(id, updateRoleDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('roles:write')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id') id: string, @Request() req) {
    return this.rolesService.remove(id, req.user);
  }
}