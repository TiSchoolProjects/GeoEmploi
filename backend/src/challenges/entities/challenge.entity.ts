import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum ChallengeType {
  VIEW_JOBS = 'view_jobs',
  UPDATE_SKILL = 'update_skill',
}

@Entity('challenges')
@Unique(['scheduledDate'])
export class Challenge {
  @ApiProperty({ description: 'Primary key ID of the challenge', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Title of the challenge', example: 'Explore New Opportunities' })
  @Column()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the challenge',
    example: 'View 5 job offers today to complete this daily challenge.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Type of action required',
    enum: ChallengeType,
    example: ChallengeType.VIEW_JOBS,
  })
  @Column({
    type: 'enum',
    enum: ChallengeType,
  })
  type: ChallengeType;

  @ApiProperty({ description: 'Target count to achieve completion', example: 5, default: 1 })
  @Column({ type: 'int', default: 1 })
  target: number;

  @ApiProperty({
    description: 'Scheduled date (YYYY-MM-DD)',
    example: '2026-09-10',
    format: 'date',
  })
  @Column({ type: 'date' })
  scheduledDate: string;

  @ApiProperty({ description: 'Whether the challenge is active', default: true, example: true })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2026-09-10T08:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2026-09-10T08:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}