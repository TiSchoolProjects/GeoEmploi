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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobId: number;

  @ManyToOne('Job', (job: Job) => job.applications, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'jobId'})
  job: Job;

  @Column()
  jobSeekerId: number;

  @ManyToOne('User', (user: User) => user.applications, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'jobSeeker'})
  jobSeeker: User;

  @Column({type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.WAITING})
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;

}
