import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class JobsScheduler implements OnModuleInit {
  private readonly logger = new Logger(JobsScheduler.name);
  
  constructor(private readonly jobsService: JobsService) {}

  async onModuleInit() {
      await this.archiveJobs();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveJobs() {
    await this.jobsService.archiveAfter30days();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeJobs() {
    try {
      const res = await this.jobsService.purgeArchiveJobs();
      this.logger.log(`Purge offres : ${res.deleted} offre(s) supprimée(s).`,);
    } catch (error) {
      this.logger.error('Erreur pendant la purge des offres.', error,);
    }
  }
}
