import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Employer } from '../employers/entities/employer.entity';
import { Seeker } from '../seekers/entities/seeker.entity';
import { Job } from '../jobs/entities/job.entity';
import { Application } from '../applications/entities/application.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, Employer, Seeker, Job, Application])],
  exports: [TypeOrmModule]
})
export class UsersModule {}
