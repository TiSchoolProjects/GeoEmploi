import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UserRole } from '../auth/roles.enum';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('jobs/:jobId')
  create(@Param('jobId', ParseIntPipe) jobId: number,
         @Body() createReportDto: CreateReportDto,
         @Req() req: Request & {user: {userId: number; role: UserRole;};},) {
    return this.reportsService.create(jobId, req.user.userId, createReportDto,);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number,) {
    return this.reportsService.resolve(id);
  }
}
