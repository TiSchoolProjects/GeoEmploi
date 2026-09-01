import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsInt, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class SearchJobDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @IsInt()
  @IsNotEmpty()
  radius: number;
} 
