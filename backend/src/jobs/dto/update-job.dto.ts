import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { IsInt, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class SearchJobDto {
  @ApiProperty({ description: 'Job latitude', example: 40.7128})
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ description: 'Job longitude', example: 74.0060})
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @ApiProperty({ description: 'Radius to use from position in kilometers', example: 50})
  @IsInt()
  @IsNotEmpty()
  radius: number;
}
