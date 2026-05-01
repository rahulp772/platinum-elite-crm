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
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  create(@Body() createDealDto: CreateDealDto, @Request() req) {
    return this.dealsService.create(createDealDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deals with pagination' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'stage', type: String, required: false })
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('stage') stage?: string,
  ) {
    return this.dealsService.findAll(req.user, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      stage,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deal by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.dealsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deal' })
  update(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @Request() req,
  ) {
    return this.dealsService.update(id, updateDealDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deal' })
  remove(@Param('id') id: string, @Request() req) {
    return this.dealsService.remove(id, req.user);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get deal activities' })
  getActivities(@Param('id') id: string, @Request() req) {
    return this.dealsService.getActivities(id, req.user);
  }

  @Post(':id/reassign')
  @ApiOperation({ summary: 'Reassign deal to another user' })
  reassign(
    @Param('id') id: string,
    @Body() body: { assignedToId: string },
    @Request() req,
  ) {
    return this.dealsService.reassign(id, body.assignedToId, req.user);
  }
}
