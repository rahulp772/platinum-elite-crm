import { IsString, IsArray, IsNotEmpty, IsOptional, IsUUID, Min, Max, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  type: 'image' | 'pdf' | 'other';

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsInt()
  size: number;
}

export class SendMessageDto {
  @ApiProperty({ example: 'Hello world' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ type: [AttachmentDto] })
  @IsArray()
  @IsOptional()
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}