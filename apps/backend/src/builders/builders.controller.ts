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
import { BuildersService } from './builders.service';
import { CreateBuilderDto, UpdateBuilderDto } from './dto/create-builder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { User } from '../users/entities/user.entity';


@ApiTags('builders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('builders')
export class BuildersController {
  constructor(private readonly buildersService: BuildersService) { }

  @Post()
  @RequirePermissions('properties:write') // Using properties:write as builders are related to properties
  @ApiOperation({ summary: 'Create a new builder' })
  create(@Body() createBuilderDto: CreateBuilderDto, @Request() req) {
    return this.buildersService.create(createBuilderDto, req.user);
  }


  @Get()
  @RequirePermissions('properties:read')
  @ApiOperation({ summary: 'Get all builders for the current tenant' })
  findAll(@Request() req) {
    return this.buildersService.findAll(req.user);
  }


  @Get(':id')
  @RequirePermissions('properties:read')
  @ApiOperation({ summary: 'Get a builder by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.buildersService.findOne(id, req.user);
  }


  @Patch(':id')
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Update a builder' })
  update(
    @Param('id') id: string,
    @Body() updateBuilderDto: UpdateBuilderDto,
    @Request() req,
  ) {
    return this.buildersService.update(id, updateBuilderDto, req.user);
  }


  @Delete(':id')
  @RequirePermissions('properties:write')
  @ApiOperation({ summary: 'Delete a builder' })
  remove(@Param('id') id: string, @Request() req) {
    return this.buildersService.remove(id, req.user);
  }

}
