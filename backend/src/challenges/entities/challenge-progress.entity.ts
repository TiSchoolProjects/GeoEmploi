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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  challengeId: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

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
