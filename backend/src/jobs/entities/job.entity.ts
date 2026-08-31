import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";


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

  @Column('decimal', {precision: 10, scale: 7})
  lat: number;

  @Column('decimal', {precision: 10, scale: 7})
  lng: number;
  
  @Column('int')
  radius: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null})
  archivedAt: Date | null;

  @OneToMany('Application', (app: Application) => app.job)
  applications: Application[];
}

