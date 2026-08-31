import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne } from "typeorm";
import { Employer } from "../../employers/entities/employer.entity";

export enum UserRole {
  SEEKER = 'seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
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

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne('Employer', (employer: Employer) => employer.user)
  employerProfile: Employer
}
