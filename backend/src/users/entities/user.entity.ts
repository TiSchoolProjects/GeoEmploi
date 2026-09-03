import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { Employer } from "../../employers/entities/employer.entity";
import { Seeker } from "../../seekers/entities/seeker.entity";
import { Job } from "../../jobs/entities/job.entity";
import { Application } from "../../applications/entities/application.entity";
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from "../../auth/roles.enum";

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

@Entity()
export class User {
  @ApiProperty({ description: 'Unique user id', example: 12345 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Email address', example: 'yourmail@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Account password', example: 'very-secret-password', writeOnly: true })
  @Column()
  password: string;

  @ApiProperty({ description: 'User firstname', example: 'John' })
  @Column()
  firstname: string;

  @ApiProperty({ description: 'User lastname', example: 'Doe' })
  @Column()
  lastname: string;

  @ApiProperty({ description: 'Account type and permissions', example: UserRole.SEEKER })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.SEEKER })
  role: UserRole;

  @ApiProperty({ description: 'Activation status of the account', example: UserStatus.ACTIVE })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ description: 'Date of account creation', example: '2026-09-02T10:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @OneToOne('Employer', (employer: Employer) => employer.user)
  employerProfile: Employer

  @OneToOne('Seeker', (seeker: Seeker) => seeker.user)
  seekerProfile: Seeker

  @OneToMany('Job', (job: Job) => job.employer)
  jobs: Job[];

  @OneToMany('Application', (app: Application) => app.jobSeeker)
  applications: Application[];
}
