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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ChallengeType,
  })
  type: ChallengeType;

  @Column({ type: 'int', default: 1 })
  target: number;

  /**
   * YYYY-MM-DD
   * volontairement stocké comme DATE,
   * pas comme timestamp.
   */
  @Column({ type: 'date' })
  scheduledDate: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
