import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  Request,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as express from 'express';
import { LeadsImportService } from './leads-import.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Leads Import')
@Controller('leads/import')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsImportController {
  constructor(private readonly leadsImportService: LeadsImportService) { }

  @Get('template')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Download lead import template' })
  async downloadTemplate(@Res({ passthrough: true }) res: express.Response) {
    const buffer = await this.leadsImportService.getTemplate();
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=leads_template.xlsx',
    });

    return new StreamableFile(buffer);
  }

  @Post('parse')
  @RequirePermissions('leads:write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Parse uploaded lead file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async parseFile(@UploadedFile() file: Express.Multer.File) {
    return this.leadsImportService.parseFile(file);
  }

  @Post('confirm')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Confirm and import leads' })
  async confirmImport(
    @Body() body: { data: any[]; mapping: Record<string, string> },
    @Request() req,
  ) {
    return this.leadsImportService.importLeads(body.data, body.mapping, req.user);
  }
}
