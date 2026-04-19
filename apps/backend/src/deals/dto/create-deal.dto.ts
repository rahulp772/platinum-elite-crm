import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { DealStage, DealPriority } from '../enums/deal.enum';

export class CreateDealDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ enum: DealStage })
  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty()
  @IsEmail()
  customerEmail: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: Date;

  @ApiProperty({ enum: DealPriority })
  @IsEnum(DealPriority)
  @IsOptional()
  priority?: DealPriority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyId?: string;
}
