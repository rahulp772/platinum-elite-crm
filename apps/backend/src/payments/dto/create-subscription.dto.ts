import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'plan_abc123' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ example: 'monthly', required: false })
  @IsString()
  @IsOptional()
  billingCycle?: 'monthly' | 'yearly';
}
