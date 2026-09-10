import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Challenge } from './challenge.entity';
import { Seeker } from '../../seekers/entities/seeker.entity';

@Entity('challenge_progress')
@Unique(['userId', 'challengeId'])
export class ChallengeProgress {
  @ApiProperty({ description: 'Primary key ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID of the seeker/user', example: 42 })
  @Column()
  userId: number;

  @ApiProperty({ description: 'ID of the associated challenge', example: 10 })
  @Column()
  challengeId: number;

  @ApiProperty({ description: 'Current progress count toward target', example: 3, default: 0 })
  @Column({ type: 'int', default: 0 })
  progress: number;

  @ApiPropertyOptional({
    description: 'Completion timestamp (null if incomplete)',
    example: '2026-09-10T10:30:00.000Z',
    nullable: true,
  })
  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  completedAt: Date | null;

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
}