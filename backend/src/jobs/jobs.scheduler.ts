import { Injectable, OnModuleInit } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class JobsScheduler implements OnModuleInit {
  
  constructor(private readonly jobsService: JobsService) {}

  async onModuleInit() {
      await this.archiveJobs();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async archiveJobs() {
    await this.jobsService.archiveAfter30days();
  }
}
