import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { UsersService } from '../users/users.service';
import { SeekersService } from '../seekers/seekers.service';
import { EmployersService } from '../employers/employers.service';
import { JobsService } from '../jobs/jobs.service';
import { ApplicationsService } from '../applications/applications.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Employer } from '../employers/entities/employer.entity';
import { Seeker } from '../seekers/entities/seeker.entity';
import { Job } from '../jobs/entities/job.entity';
import { Application } from '../applications/entities/application.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { CoordinatesModule } from '../common/coordinates.module';

@Module({
    controllers: [ExportController],
    providers: [ExportService,
        UsersService,
        SeekersService,
        EmployersService,
        JobsService,
        ApplicationsService,
        NotificationsService,
        ConfigService,
    ],
    imports: [TypeOrmModule.forFeature([User, Employer, Seeker, Job, Application, Notification]), CoordinatesModule],
    exports: [ExportService]
})
export class ExportModule { }
