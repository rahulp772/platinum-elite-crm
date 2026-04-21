import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { LeadStatus, LeadSource, LostReason } from '../enums/lead.enum';

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ enum: LeadSource })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMin?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMax?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bedroom?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  followUpAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  siteVisitScheduledAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  siteVisitDoneAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  whatsappNumber?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ enum: LeadSource })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMin?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMax?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bedroom?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  followUpAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  siteVisitScheduledAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  siteVisitDoneAt?: string;

  @ApiProperty({ enum: LostReason })
  @IsEnum(LostReason)
  @IsOptional()
  lostReason?: LostReason;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  whatsappNumber?: string;
}

export class LeadLookupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;
}