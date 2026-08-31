import { Entity, Column, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import type { User } from "../../users/entities/user.entity";

@Entity('seeker')
export class Seeker {
  @PrimaryColumn()
  userId: number;

  @Column('simple-array', {nullable: true})
  skills: string[];

  @Column({nullable: true})
  experience: string;

  @Column({nullable: true})
  availability: string;

  @OneToOne('User', (user: User) => user.seekerProfile, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;
}
