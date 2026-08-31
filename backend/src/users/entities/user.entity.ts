import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

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

  @CreateDateColumn()
  createdAt: Date;
}
