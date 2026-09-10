import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ChallengeType } from '../entities/challenge.entity';

export class CreateChallengeDto {
  @ApiProperty({
    description: 'Title of the challenge',
    example: 'Explore New Opportunities',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the challenge objectives',
    example: 'View 5 job offers today to complete this daily challenge.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of the challenge action required',
    enum: ChallengeType,
    example: ChallengeType.VIEW_JOBS,
  })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({
    description: 'Target count needed to complete the challenge',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  target: number;

  @ApiProperty({
    description: 'Scheduled date for the challenge (YYYY-MM-DD format)',
    example: '2026-09-10',
    format: 'date',
  })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({
    description: 'Indicates whether the challenge is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}