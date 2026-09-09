import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './entities/job.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JobsScheduler } from './jobs.scheduler';
import { CoordinatesModule } from '../common/coordinates.module';
import { Employer } from '../employers/entities/employer.entity';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsScheduler,],
  imports: [AuthModule, CoordinatesModule, TypeOrmModule.forFeature([Job, User, Application, Employer])],
  exports: [TypeOrmModule]

})
export class JobsModule {}
