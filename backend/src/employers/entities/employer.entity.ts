import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity('employer_profiles')
export class Employer {
  @PrimaryColumn()
  userId: number;

  @OneToOne('User', (user: User) => user.employerProfile, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;

  @Column()
  companyName: string;

  @Column()
  companyDesc: string;

  @Column({type: 'timestamp', nullable: true, default: null })
  verifiedAt: Date | null;

}
