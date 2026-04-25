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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadLookupDto } from './dto/create-lead.dto';
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

  @Get('my')
  @ApiOperation({ summary: 'Get my leads' })
  getMyLeads(@Request() req) {
    return this.leadsService.getMyLeads(req.user);
  }

  @Get('followups')
  @ApiOperation({ summary: 'Get upcoming follow-ups (today)' })
  getUpcomingFollowUps(@Request() req) {
    return this.leadsService.getUpcomingFollowUps(req.user);
  }

  @Get('followups/overdue')
  @ApiOperation({ summary: 'Get overdue follow-ups' })
  getOverdueFollowUps(@Request() req) {
    return this.leadsService.getOverdueFollowUps(req.user);
  }

  @Get('new')
  @ApiOperation({ summary: 'Get new leads' })
  getNewLeads(@Request() req) {
    return this.leadsService.getNewLeads(req.user);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Lookup lead by phone number (admin only)' })
  @ApiQuery({ name: 'phone', type: String })
  lookup(@Query('phone') phone: string, @Request() req) {
    return this.leadsService.lookup(phone, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.leadsService.findOne(id, req.user);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get lead activities' })
  getActivities(@Param('id') id: string, @Request() req) {
    return this.leadsService.getActivities(id, req.user);
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

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign leads to a user' })
  bulkAssign(@Body() body: { leadIds: string[]; assignedToId: string }, @Request() req) {
    return this.leadsService.bulkAssign(body.leadIds, body.assignedToId, req.user);
  }
}