import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Applicant id', example: 12345})
  @IsNumber()
  @IsNotEmpty()
  jobSeekerId: number;

  @ApiProperty({ description: 'Job id', example: 12345})
  @IsNumber()
  @IsNotEmpty()
  jobId: number;
}
