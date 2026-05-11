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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadLookupDto,
} from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { LeadAiEngineService } from './services/lead-ai-engine.service';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadAiEngineService: LeadAiEngineService,
  ) {}

  @Post()
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Create a new lead' })
  create(@Body() createLeadDto: CreateLeadDto, @Request() req) {
    return this.leadsService.create(createLeadDto, req.user);
  }

  @Get()
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get all leads with pagination' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiQuery({ name: 'source', type: String, required: false })
  @ApiQuery({ name: 'assignedToId', type: String, required: false })
  @ApiQuery({ name: 'builderId', type: String, required: false })
  @ApiQuery({ name: 'date', type: String, required: false })
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('builderId') builderId?: string,
    @Query('date') date?: string,
  ) {
    return this.leadsService.findAll(req.user, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
      source,
      assignedToId,
      builderId,
      date,
    });
  }

  @Get('my-leads')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get my leads' })
  getMyLeads(@Request() req) {
    return this.leadsService.getMyLeads(req.user);
  }

  @Get('followups')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get upcoming follow-ups (today)' })
  getUpcomingFollowUps(@Request() req) {
    return this.leadsService.getUpcomingFollowUps(req.user);
  }

  @Get('followups/overdue')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get overdue follow-ups' })
  getOverdueFollowUps(@Request() req) {
    return this.leadsService.getOverdueFollowUps(req.user);
  }

  @Get('new')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get new leads' })
  getNewLeads(@Request() req) {
    return this.leadsService.getNewLeads(req.user);
  }

  @Get('lookup')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Lookup lead by phone number (admin only)' })
  @ApiQuery({ name: 'phone', type: String })
  lookup(@Query('phone') phone: string, @Request() req) {
    return this.leadsService.lookup(phone, req.user);
  }

  @Get(':id')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get a lead by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.leadsService.findOne(id, req.user);
  }

  @Get(':id/activities')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get lead activities' })
  getActivities(@Param('id') id: string, @Request() req) {
    return this.leadsService.getActivities(id, req.user);
  }

  @Get(':id/suggestion')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get AI suggestion for lead' })
  getAiSuggestion(@Param('id') id: string, @Request() req) {
    return this.leadsService.findOne(id, req.user).then((lead) => {
      return this.leadAiEngineService.suggestNextAction(lead);
    });
  }

  @Patch(':id')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Update a lead' })
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Request() req,
  ) {
    return this.leadsService.update(id, updateLeadDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Delete a lead' })
  remove(@Param('id') id: string, @Request() req) {
    return this.leadsService.remove(id, req.user);
  }

  @Post('bulk-assign')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Bulk assign leads to a user' })
  bulkAssign(
    @Body() body: { leadIds: string[]; assignedToId: string },
    @Request() req,
  ) {
    return this.leadsService.bulkAssign(
      body.leadIds,
      body.assignedToId,
      req.user,
    );
  }

  @Post(':id/reassign')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Reassign lead to another user' })
  reassign(
    @Param('id') id: string,
    @Body() body: { assignedToId: string },
    @Request() req,
  ) {
    return this.leadsService.reassign(id, body.assignedToId, req.user);
  }

  @Post(':id/log-activity')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Log activity for lead' })
  logActivity(
    @Param('id') id: string,
    @Body() body: { action: string; description?: string },
    @Request() req,
  ) {
    return this.leadsService.logLeadActivity(
      id,
      body.action,
      body.description,
      req.user,
    );
  }
}
