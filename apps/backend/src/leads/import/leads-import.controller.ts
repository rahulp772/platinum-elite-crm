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
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as express from 'express';
import { LeadsImportService } from './leads-import.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { DuplicateStrategy } from './entities/import-session.entity';

@ApiTags('Leads Import')
@Controller('leads/import')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsImportController {
  constructor(private readonly leadsImportService: LeadsImportService) {}

  @Get('template')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Download lead import template' })
  async downloadTemplate(@Res() res: express.Response) {
    const buffer = await this.leadsImportService.getTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_template.xlsx');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(buffer);
  }

  @Post('upload')
  @RequirePermissions('leads:write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file for import' })
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
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.leadsImportService.uploadFile(file, req.user);
  }

  @Post('parse/:sessionId')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Parse uploaded file and return headers' })
  async parseFile(@Param('sessionId') sessionId: string) {
    return this.leadsImportService.parseFile(sessionId);
  }

  @Post('validate/:sessionId')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Validate sample rows (100 rows)' })
  async validateSample(
    @Param('sessionId') sessionId: string,
    @Body() body: { mapping: Record<string, string> },
  ) {
    return this.leadsImportService.validateSample(sessionId, body.mapping);
  }

  @Post('start/:sessionId')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Start the import process' })
  async startImport(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      mapping: Record<string, string>;
      duplicateStrategy?: DuplicateStrategy;
    },
  ) {
    return this.leadsImportService.startImport(
      sessionId,
      body.mapping,
      body.duplicateStrategy || DuplicateStrategy.SKIP,
    );
  }

  @Get('status/:sessionId')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Get import status and progress' })
  async getStatus(@Param('sessionId') sessionId: string) {
    return this.leadsImportService.getStatus(sessionId);
  }

  @Post('cancel/:sessionId')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Cancel a running import' })
  async cancelImport(@Param('sessionId') sessionId: string) {
    return this.leadsImportService.cancelImport(sessionId);
  }

  @Get('report/:sessionId')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Download error report CSV' })
  async getErrorReport(
    @Param('sessionId') sessionId: string,
    @Res() res: express.Response,
  ) {
    const buffer = await this.leadsImportService.generateErrorReport(sessionId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=import_errors_${sessionId}.csv`);
    res.send(buffer);
  }

  @Post('delete/:sessionId')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Delete import session and file' })
  async deleteSession(@Param('sessionId') sessionId: string) {
    await this.leadsImportService.deleteSessionFile(sessionId);
    return { message: 'Session deleted' };
  }
}
