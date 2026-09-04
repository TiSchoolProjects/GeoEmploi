import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployerDto {

  @ApiPropertyOptional({ description: 'Name of the company', example: 'PlaceHolder ltd inc.' })
  @IsString()
  @IsOptional()
  companyName: string;

  @ApiPropertyOptional({ description: 'Description of the company', example: 'Provider of informatic services' })
  @IsString()
  @IsOptional()
  companyDesc: string;
}
