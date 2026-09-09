import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) { }

export class UpdateApplicationStatusDto {
  @ApiProperty({ description: 'New application status', enum: ApplicationStatus, example: ApplicationStatus.ACCEPTED })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
