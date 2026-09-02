import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployerDto {
  @ApiProperty({ description: 'Unique user id', example: 12345 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Name of the company', example: 'PlaceHolder ltd inc.' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ description: 'Description of the company', example: 'Provider of informatic services' })
  @IsString()
  companyDesc: string;
}
