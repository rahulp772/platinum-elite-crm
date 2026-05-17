import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class RazorpayWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty()
  @IsObject()
  payload: Record<string, any>;
}
