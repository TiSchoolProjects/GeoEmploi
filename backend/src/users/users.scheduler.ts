import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class UsersScheduler implements OnModuleInit {
  private readonly logger = new Logger(UsersScheduler.name);

  constructor(private readonly usersService: UsersService) { }

  async onModuleInit() {
    await this.removeInactiveAccounts();
  }

  @Cron(CronExpression.EVERY_WEEK)
  async removeInactiveAccounts() {
    this.logger.log('Nettoyage des comptes inactifs...');
    try {
      const removedCount = await this.usersService.removeAfter2Years();
      this.logger.log(`${removedCount} utilisateurs inactifs retirés.`);
    } catch (error) {
      this.logger.error('Erreur pendant le nettoyage:', error);
    }
  }
}