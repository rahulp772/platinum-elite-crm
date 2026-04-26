import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
  Allow,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@realty.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @Allow()
  @IsOptional()
  tenantId?: string;
}
