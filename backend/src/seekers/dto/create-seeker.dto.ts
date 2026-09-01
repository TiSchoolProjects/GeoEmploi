import { IsArray, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSeekerDto {

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @IsString({ each: true})
  @IsNotEmpty()
  skills: string[];

  @IsString()
  experience: string;

  @IsString()
  availability: string;
}
