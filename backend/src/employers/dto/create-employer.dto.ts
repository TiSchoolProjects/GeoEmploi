import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployerDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  companyDesc: string;
}
