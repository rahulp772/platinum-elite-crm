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
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto } from './dto/create-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamsService.create(createTeamDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  findAll(@Request() req) {
    return this.teamsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.teamsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team' })
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto, @Request() req) {
    return this.teamsService.update(id, updateTeamDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team' })
  remove(@Param('id') id: string, @Request() req) {
    return this.teamsService.remove(id, req.user);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get team members' })
  getTeamMembers(@Param('id') id: string, @Request() req) {
    return this.teamsService.getTeamMembers(id, req.user);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user team' })
  getUserTeam(@Param('userId') userId: string, @Request() req) {
    return this.teamsService.getUserTeam(userId, req.user);
  }

  @Get('lead/:userId/members')
  @ApiOperation({ summary: 'Get team members for a team lead' })
  getTeamLeadMembers(@Request() req) {
    return this.teamsService.getTeamLeadMembers(req.user);
  }
}