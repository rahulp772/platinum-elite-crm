import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFloorPlanDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  plotSize: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;
}

export class UpdateFloorPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  plotSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;
}
