import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateJobDto {

  @ApiProperty({ description: 'Employer id', example: 12345 })
  @IsNumber()
  @IsNotEmpty()
  employerId: number;

  @ApiProperty({ description: 'Job title', example: 'Fullstack developer'})
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Job description', example: 'Senior developer to work on networking website on a NestJs + React stack'})
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Job address', example: '123 Elm Street, New York, NY 10001'})
  @IsString()
  @IsNotEmpty()
  adress: string;
}
