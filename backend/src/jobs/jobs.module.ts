import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './entities/job.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [JobsController],
  providers: [JobsService],
  imports: [AuthModule, TypeOrmModule.forFeature([Job, User, Application])],
  exports: [TypeOrmModule]

})
export class JobsModule {}
