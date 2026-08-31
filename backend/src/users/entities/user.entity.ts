import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { Employer } from "../../employers/entities/employer.entity";
import { Seeker } from "../../seekers/entities/seeker.entity";
import { Job } from "../../jobs/entities/job.entity";
import { Application } from "../../applications/entities/application.entity";

export enum UserRole {
  SEEKER = 'seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;

  @Column()
  password: string;

  @Column({default: false })
  isValid: boolean

  @Column({type: 'enum', enum: UserRole, default: UserRole.SEEKER})
  role: UserRole;

  @Column({type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE})
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne('Employer', (employer: Employer) => employer.user)
  employerProfile: Employer

  @OneToOne('Seeker', (seeker: Seeker) => seeker.user)
  seekerProfile: Seeker

  @OneToMany('Job', (job: Job) => job.employer)
  jobs: Job[];

  @OneToMany('Application', (app : Application) => app.jobSeeker)
  applications : Application[];
  
}
