import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { TaskStatus, TaskPriority, TaskType } from '../enums/task.enum';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ enum: TaskType })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dueDate: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  relatedToId?: string;

  @ApiPropertyOptional({ enum: ['deal', 'property', 'lead'] })
  @IsEnum(['deal', 'property', 'lead'])
  @IsOptional()
  relatedToType?: 'deal' | 'property' | 'lead';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedToId?: string;
}
