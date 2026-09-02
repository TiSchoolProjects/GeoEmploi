import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";

export enum GeoCodingStatus {
  VALID = 'valid',
  TO_VERIFY = 'to_verify',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employerId: number;

  @ManyToOne('User', (user: User) => user.jobs, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'employerId'})
  employer: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  adress: string;

  @Column('decimal', {precision: 10, scale: 7, nullable: true})
  lat: number | null;

  @Column('decimal', {precision: 10, scale: 7, nullable: true})
  lng: number | null;

  @Column({type: 'varchar', nullable: true})
  geocodingSource: string | null;

  @Column({type: 'decimal',precision: 5, scale: 4, nullable: true})
  geocodingScore: number | null;

  @Column({type: 'timestamp', nullable: true, default: null})
  geocodedAt: Date | null;

  @Column({type: 'enum', enum: GeoCodingStatus, default: GeoCodingStatus.TO_VERIFY})
  GeocodingStatus: GeoCodingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null})
  archivedAt: Date | null;

  @OneToMany('Application', (app: Application) => app.job)
  applications: Application[];
}

