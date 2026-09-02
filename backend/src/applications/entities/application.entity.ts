import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Job } from "../../jobs/entities/job.entity";


export enum ApplicationStatus {
  WAITING = 'waiting',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}


@Entity('applications')
export class Application {
  @ApiProperty({ description: 'Unique application id', example: 12345 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Linked job id', example: 12345})
  @Column()
  jobId: number;

  @ManyToOne('Job', (job: Job) => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @ApiProperty({ description: 'Applicant id', example: 12345})
  @Column()
  jobSeekerId: number;

  @ManyToOne('User', (user: User) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobSeeker' })
  jobSeeker: User;

  @ApiProperty({ description: 'Application status', example: ApplicationStatus.ACCEPTED})
  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.WAITING })
  status: ApplicationStatus;

  @ApiProperty({ description: 'Application date', example: '2026-09-02T14:55:41.523Z'})
  @CreateDateColumn()
  createdAt: Date;

}
