import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";


@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  receverId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE'})
  @JoinColumn({name: 'receverId'})
  recever: User;

  @Column()
  applicationId: number;


  @ManyToOne(() => Application, { onDelete: 'CASCADE'})
  @JoinColumn({name: 'applicationId'})
  application: Application;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
