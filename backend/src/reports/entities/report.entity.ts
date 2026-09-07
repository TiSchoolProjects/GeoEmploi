import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Job } from "../../jobs/entities/job.entity";

export enum ReportReason {
  FRAUD = 'fraud',
  MISLEADING = 'misleading',
  DISCRIMINATORY = 'discriminatory',
  NON_COMPLIANT = 'non_compliant',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobId: number;

  @ManyToOne(() => Job, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'jobId'})
  job: Job;

  @Column({nullable: true})
  reporterId: number | null;

  @ManyToOne(() => User, {nullable: true, onDelete: 'SET NULL',})
  @JoinColumn({name: 'reporterId'})
  reporter: User | null;

  @ApiProperty({enum: ReportReason, example: ReportReason.MISLEADING,})
  @Column({type: 'enum', enum: ReportReason,})
  reason: ReportReason;

  @ApiProperty({example: "Cette offre demande de payer pour postuler.",})
  @Column('text')
  description: string;

  @Column({type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING,})
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({type: 'timestamp', nullable: true, default: null,})
  resolvedAt: Date | null;
}
