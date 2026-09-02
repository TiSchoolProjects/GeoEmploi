import { IsNumber, IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateJobDto {

  @IsNumber()
  @IsNotEmpty()
  employerId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  adress: string;
}
