import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import type { User } from "../../users/entities/user.entity";

@Entity('seeker')
export class Seeker {
  @ApiProperty({ description: 'Unique user id', example: 12345 })
  @PrimaryColumn()
  userId: number;

  @ApiProperty({ description: 'Array of skills', example: ['Management', 'Python', 'Fullstack'] })
  @Column('simple-array', { nullable: true })
  skills: string[];

  @ApiProperty({ description: 'Job experience', example: '2 years' })
  @Column({ nullable: true })
  experience: string;

  @ApiProperty({ description: 'Time until user is available', example: 'Immediately' })
  @Column({ nullable: true })
  availability: string;

  @OneToOne('User', (user: User) => user.seekerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
