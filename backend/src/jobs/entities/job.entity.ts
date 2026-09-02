import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";

export enum GeoCodingStatus {
  VALID = 'valid',
  TO_VERIFY = 'to_verify',
}

@Entity('jobs')
export class Job {
  @ApiProperty({ description: 'Unique job id', example: 12345})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Employer id', example: 12345})
  @Column()
  employerId: number;

  @ManyToOne('User', (user: User) => user.jobs, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'employerId'})
  employer: User;

  @ApiProperty({ description: 'Job title', example: 'Fullstack developer'})
  @Column()
  title: string;

  @ApiProperty({ description: 'Job description', example: 'Senior developer to work on networking website on a NestJs + React stack'})
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Job address', example: '123 Elm Street, New York, NY 10001'})
  @Column()
  adress: string;

  @ApiProperty({ description: 'Job latitude', example: 40.7128})
  @Column('decimal', {precision: 10, scale: 7, nullable: true})
  lat: number | null;

  @ApiProperty({ description: 'Job longitude', example: 74.0060})
  @Column('decimal', {precision: 10, scale: 7, nullable: true})
  lng: number | null;

  @ApiProperty({ description: 'Source of the geocoding api', example: 'api-addresse'})
  @Column({type: 'varchar', nullable: true})
  geocodingSource: string | null;

  @ApiProperty({ description: 'Geocoding score', example: 0.97072})
  @Column({type: 'decimal',precision: 5, scale: 4, nullable: true})
  geocodingScore: number | null;

  @ApiProperty({ description: 'Geocoding creation date', example: '2026-09-02T14:55:41.523Z'})
  @Column({type: 'timestamp', nullable: true, default: null})
  geocodedAt: Date | null;

  @ApiProperty({ description: 'Verification status of the geocoding', example: GeoCodingStatus.VALID})
  @Column({type: 'enum', enum: GeoCodingStatus, default: GeoCodingStatus.TO_VERIFY})
  GeocodingStatus: GeoCodingStatus;

  @ApiProperty({ description: 'Job creation date', example: '2026-09-02T14:55:41.523Z'})
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Job archive date', example: '2026-09-02T14:55:41.523Z'})
  @Column({ type: 'timestamp', nullable: true, default: null})
  archivedAt: Date | null;

  @OneToMany('Application', (app: Application) => app.job)
  applications: Application[];
}

