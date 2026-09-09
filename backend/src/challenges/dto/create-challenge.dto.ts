import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ChallengeType,
} from '../entities/challenge.entity';

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ChallengeType)
  type: ChallengeType;

  @IsInt()
  @Min(1)
  target: number;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
