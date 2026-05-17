import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifySubscriptionDto {
  @ApiProperty({ example: 'sub_abc123' })
  @IsString()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({ example: 'pay_abc123' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ example: 'abc123...', required: false })
  @IsString()
  @IsOptional()
  signature?: string;
}
