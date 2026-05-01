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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property listing' })
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(createPropertyDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all property listings with pagination' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiQuery({ name: 'type', type: String, required: false })
  @ApiQuery({ name: 'sortBy', type: String, required: false })
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.propertiesService.findAll(req.user, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
      type,
      sortBy,
    });
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related properties by type' })
  async findRelated(@Param('id') id: string, @Request() req) {
    const property = await this.propertiesService.findOne(id, req.user);
    return this.propertiesService.findRelated(id, property.type, 3, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.propertiesService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property listing' })
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req,
  ) {
    return this.propertiesService.update(id, updatePropertyDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property listing' })
  remove(@Param('id') id: string, @Request() req) {
    return this.propertiesService.remove(id, req.user);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite status for a property' })
  toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.propertiesService.toggleFavorite(id, req.user);
  }
}
