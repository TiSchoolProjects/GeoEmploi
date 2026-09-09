import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

import { Job } from '../jobs/entities/job.entity';
import { Application } from '../applications/entities/application.entity';
import { Employer } from '../employers/entities/employer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      Application,
      Employer,
    ]),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
