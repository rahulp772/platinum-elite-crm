import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InfrastructureCategory } from '../entities/nearby-infrastructure.entity';

export class CreateNearbyInfrastructureDto {
  @ApiProperty({ enum: InfrastructureCategory })
  @IsEnum(InfrastructureCategory)
  @IsNotEmpty()
  category: InfrastructureCategory;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  distance?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;
}

export class UpdateNearbyInfrastructureDto {
  @ApiPropertyOptional({ enum: InfrastructureCategory })
  @IsOptional()
  @IsEnum(InfrastructureCategory)
  category?: InfrastructureCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  distance?: string;
}
