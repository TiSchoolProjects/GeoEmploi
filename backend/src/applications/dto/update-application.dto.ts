import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';
import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
