import { ApiProperty } from '@nestjs/swagger';

export class JobsByCommuneResponseDto {
  @ApiProperty({ description: 'Name of the commune', example: 'Rennes' })
  commune: string;

  @ApiProperty({ description: 'Total job count in this commune', example: 42 })
  count: number;
}