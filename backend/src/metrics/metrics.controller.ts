import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('admin')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
  ) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN)
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
