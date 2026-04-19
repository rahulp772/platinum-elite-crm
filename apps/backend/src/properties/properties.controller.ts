import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get all property listings' })
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related properties by type' })
  async findRelated(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    return this.propertiesService.findRelated(id, property.type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by ID' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property listing' })
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property listing' })
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite status for a property' })
  toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.propertiesService.toggleFavorite(id, req.user);
  }
}
