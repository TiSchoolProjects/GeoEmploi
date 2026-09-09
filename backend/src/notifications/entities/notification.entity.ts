import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity('notifications')
export class Notification {
  @ApiProperty({ description: 'Unique notification id', example: 12345 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Unique user id', example: 12345 })
  @Index()
  @Column()
  receverId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receverId' })
  recever: User;

  @ApiProperty({ description: 'Unique application id', example: 12345 })
  @Column()
  applicationId: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @ApiProperty({ description: 'Name of the offer', example: 'Fullstack developer' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Description of the notification', example: 'You have received a new application' })
  @Column('text')
  message: string;

  @ApiProperty({ description: 'Time at which the notification was seen', example: '2026-08-25T09:00:00Z' })
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @ApiProperty({ description: 'Time at which the notification was created', example: '2026-08-25T09:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;
}
