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
  @ApiProperty({ description: 'Unique report id', example: 12345 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Unique job id', example: 12345 })
  @Column()
  jobId: number;

  @ManyToOne(() => Job, {
    onDelete: 'CASCADE',
  })

  @ApiProperty({ description: 'Linked job' })
  @JoinColumn({name: 'jobId'})
  job: Job;

  @ApiProperty({ description: 'Unique id of the user that filed the report', example: 12345 })
  @Column({nullable: true})
  reporterId: number | null;

  @ManyToOne(() => User, {nullable: true, onDelete: 'SET NULL',})
  @JoinColumn({name: 'reporterId'})
  reporter: User | null;

  @ApiProperty({description: 'Reason for the report', enum: ReportReason, example: ReportReason.MISLEADING,})
  @Column({type: 'enum', enum: ReportReason,})
  reason: ReportReason;

  @ApiProperty({description: 'Detail of the report', example: "Cette offre demande de payer pour postuler."})
  @Column('text')
  description: string;

  @ApiProperty({description: 'Reports status', enum: ReportStatus, example: ReportStatus.PENDING})
  @Column({type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING,})
  status: ReportStatus;

  @ApiProperty({ description: 'Time at which the report was filed', example: '2026-08-25T09:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Time at which the report was resolved', example: '2026-08-25T09:00:00Z' })
  @Column({type: 'timestamp', nullable: true, default: null,})
  resolvedAt: Date | null;
}
