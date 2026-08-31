import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @IsNumber()
  @IsNotEmpty()
  jobSeekerId: number;

  @IsNumber()
  @IsNotEmpty()
  jobId: number;
}
