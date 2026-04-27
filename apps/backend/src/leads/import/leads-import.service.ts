import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Lead } from '../entities/lead.entity';
import { LeadStatus, LeadSource, LeadTier } from '../enums/lead.enum';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LeadsImportService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async getTemplate() {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'WhatsApp Number',
      'Status',
      'Source',
      'Budget Min',
      'Budget Max',
      'Preferred Location',
      'Property Type',
      'Bedroom',
      'Tier',
      'Notes',
    ];

    const sampleData = [
      {
        Name: 'John Doe',
        Email: 'john@example.com',
        Phone: '9876543210',
        'WhatsApp Number': '9876543210',
        Status: 'new',
        Source: 'website',
        'Budget Min': 5000000,
        'Budget Max': 10000000,
        'Preferred Location': 'Mumbai',
        'Property Type': '2 BHK',
        Bedroom: 2,
        Tier: 'medium',
        Notes: 'Looking for a sea-facing apartment.',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Template');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async parseFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get headers
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const headers: string[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
      headers.push(cell ? cell.v.toString() : `Column ${C + 1}`);
    }

    // Get all data
    const data = XLSX.utils.sheet_to_json(worksheet, { header: headers, range: 1 });
    const preview = data.slice(0, 5);

    return {
      headers,
      preview,
      data, // Return all data for the frontend to send back in confirm
      totalRows: data.length,
    };
  }

  async importLeads(data: any[], mapping: Record<string, string>, user: User) {
    const leadsToSave: Partial<Lead>[] = [];
    const errors: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const leadData: Partial<Lead> = {
        tenantId: user.tenantId,
      };

      try {
        // Apply mapping: mapping is now { systemField: fileColumn }
        Object.entries(mapping).forEach(([systemField, fileColumn]) => {
          if (fileColumn && fileColumn !== 'unmapped' && row[fileColumn] !== undefined) {
            let value = row[fileColumn];
            
            // Basic data transformation/validation
            if (systemField === 'budgetMin' || systemField === 'budgetMax' || systemField === 'bedroom') {
              value = parseFloat(value) || 0;
            }
            
            if (systemField === 'phone' || systemField === 'whatsappNumber') {
                value = value.toString();
            }

            (leadData as any)[systemField] = value;
          }
        });

        if (!leadData.name || !leadData.phone) {
           errors.push({ row: i + 1, error: 'Missing required fields (Name or Phone)' });
           continue;
        }

        leadsToSave.push(leadData);
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    // Bulk insert
    // Note: This doesn't handle duplicates gracefully if we use save() with unique constraint.
    // We might want to use insert/upsert or check before saving.
    // For now, let's do it row by row to capture errors or use a try-catch on the whole thing.
    
    let successCount = 0;
    for (const lead of leadsToSave) {
        try {
            await this.leadRepository.save(lead);
            successCount++;
        } catch (err) {
            let errorMessage = err.message;
            
            // Handle PostgreSQL unique constraint violation (Error code 23505)
            if (err.code === '23505' || err.message.includes('unique constraint') || err.message.includes('duplicate key')) {
                errorMessage = `A lead with the phone number '${lead.phone}' already exists.`;
            }
            
            errors.push({ lead: lead.name, error: errorMessage });
        }
    }

    return {
      total: data.length,
      successCount,
      errorCount: errors.length,
      errors,
    };
  }
}
