import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateJobDto {

  @ApiPropertyOptional({ description: 'Job title', example: 'Fullstack developer'})
  @IsString()
  @IsOptional()
  title: string;

  @ApiPropertyOptional({ description: 'Job description', example: 'Senior developer to work on networking website on a NestJs + React stack'})
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ description: 'Job address', example: '123 Elm Street, New York, NY 10001'})
  @IsString()
  @IsOptional()
  adress: string;

}

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
