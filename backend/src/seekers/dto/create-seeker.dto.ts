import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSeekerDto {
  @ApiProperty({ description: 'Unique user id', example: 12345})
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Array of skills', example: ['Management', 'Python', 'Fullstack']})
  @IsArray()
  @IsString({ each: true})
  @IsNotEmpty()
  skills: string[];

  @ApiProperty({ description: 'Job experience', example: '2 years'})
  @IsString()
  experience: string;

  @ApiProperty({ description: 'Time until user is available', example: 'Immediately'})
  @IsString()
  availability: string;
}
