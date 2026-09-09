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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  challengeId: number;

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

  @CreateDateColumn()
  createdAt: Date;
}
