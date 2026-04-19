import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';
import '@nestjs/common';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
