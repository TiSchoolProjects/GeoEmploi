import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Job } from '../jobs/entities/job.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  imports: [TypeOrmModule.forFeature([Application, Job, User, ]),
    NotificationsModule,
  ],
  exports: [TypeOrmModule]
})
export class ApplicationsModule {}
