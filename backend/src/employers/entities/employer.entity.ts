import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity('employer_profiles')
export class Employer {
  @ApiProperty({ description: 'Unique user id', example: 12345 })
  @PrimaryColumn()
  userId: number;

  @OneToOne('User', (user: User) => user.employerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'Name of the company', example: 'PlaceHolder ltd inc.' })
  @Column()
  companyName: string;

  @ApiProperty({ description: 'Description of the company', example: 'Provider of informatic services' })
  @Column()
  companyDesc: string;

  @ApiProperty({ description: 'Date of company verification', example: '2026-09-02T10:00:00.000Z' })
  @Column({ type: 'timestamp', nullable: true, default: null })
  verifiedAt: Date | null;

}
