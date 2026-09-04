import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateSeekerDto {
  @ApiPropertyOptional({ description: 'Array of skills', example: ['Management', 'Python', 'Fullstack']})
  @IsArray()
  @IsString({ each: true})
  @IsOptional()
  skills: string[];

  @ApiPropertyOptional({ description: 'Job experience', example: '2 years'})
  @IsString()
  @IsOptional()
  experience: string;

  @ApiPropertyOptional({ description: 'Time until user is available', example: 'Immediately'})
  @IsString()
  @IsOptional()
  availability: string;
}
