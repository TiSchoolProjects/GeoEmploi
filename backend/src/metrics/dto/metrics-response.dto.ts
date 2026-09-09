import { ApiProperty } from '@nestjs/swagger';
import { JobsByCommuneResponseDto } from './jobs-by-commune-response.dto';

export class MetricsResponseDto {
  @ApiProperty({ description: 'Total number of registered jobs', example: 150 })
  jobs: number;

  @ApiProperty({ description: 'Total number of job applications submitted', example: 320 })
  applications: number;

  @ApiProperty({ description: 'Total number of registered employers', example: 45 })
  employers: number;

  @ApiProperty({
    description: 'Job counts grouped by commune',
    type: [JobsByCommuneResponseDto],
  })
  jobsByCommune: JobsByCommuneResponseDto[];
}