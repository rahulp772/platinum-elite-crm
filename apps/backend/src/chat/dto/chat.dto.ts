import { IsString, IsArray, IsNotEmpty, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello world' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateConversationDto {
  @ApiProperty({ example: ['user-id-1', 'user-id-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  participantIds: string[];
}

export class GetMessagesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}