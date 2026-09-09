import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job } from '../jobs/entities/job.entity';
import { Application } from '../applications/entities/application.entity';
import { Employer } from '../employers/entities/employer.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,

    @InjectRepository(Employer)
    private readonly employerRepository: Repository<Employer>,
  ) {}

  async getMetrics() {
    const jobs = await this.jobRepository.count();

    const applications =
      await this.applicationRepository.count();

    const employers =
      await this.employerRepository.count();

    const jobsByCommune =
      await this.jobRepository
        .createQueryBuilder('job')
        .select('job.commune', 'commune')
        .addSelect('COUNT(job.id)', 'count')
        .groupBy('job.commune')
        .orderBy('COUNT(job.id)', 'DESC')
        .getRawMany();

    return {
      jobs,
      applications,
      employers,
      jobsByCommune: jobsByCommune.map(
        (row: { commune: string; count: string }) => ({
          commune: row.commune,
          count: Number(row.count),
        }),
      ),
    };
  }
}
