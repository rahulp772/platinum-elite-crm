import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { PropertyStatus, PropertyType } from '../enums/property.enum';

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @ApiProperty()
  @IsNumber()
  sqft: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  lotSize?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mlsId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  builderId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reraNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reraAuthority?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reraWebsite?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  landParcel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  surveyNumber?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  carpetArea?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  builtUpArea?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  superBuiltUpArea?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  pricePerSqft?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bookingAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentPlan?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  plc?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  gst?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  parking?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  launchDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  possessionDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  constructionStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ccUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ocUrl?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalLandArea?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  unitCount?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  minPlotSize?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxPlotSize?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  ratePerSqft?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dtcpApproval?: string;
}
