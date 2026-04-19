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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  create(@Body() createLeadDto: CreateLeadDto, @Request() req) {
    return this.leadsService.create(createLeadDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads' })
  findAll(@Request() req) {
    return this.leadsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.leadsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto, @Request() req) {
    return this.leadsService.update(id, updateLeadDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead' })
  remove(@Param('id') id: string, @Request() req) {
    return this.leadsService.remove(id, req.user);
  }
}
