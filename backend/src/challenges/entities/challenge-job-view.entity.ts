import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

import { Challenge } from './challenge.entity';
import { Seeker } from '../../seekers/entities/seeker.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity('challenge_job_views')
@Unique([
  'userId',
  'challengeId',
  'jobId',
])
export class ChallengeJobView {
  @ApiProperty({ description: 'Primary key ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID of the seeker/user who viewed the job', example: 42 })
  @Column()
  userId: number;

  @ApiProperty({ description: 'ID of the associated challenge', example: 10 })
  @Column()
  challengeId: number;

  @ApiProperty({ description: 'ID of the job that was viewed', example: 105 })
  @Column()
  jobId: number;

  @ManyToOne(
    () => Seeker,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'userId',
  })
  seeker: Seeker;

  @ManyToOne(
    () => Challenge,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'challengeId',
  })
  challenge: Challenge;

  @ManyToOne(
    () => Job,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'jobId',
  })
  job: Job;

  @ApiProperty({ description: 'Timestamp when the view event was logged', example: '2026-09-10T09:15:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;
}