import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';
import { applyDoc, findAllDoc, findOneDoc, findBySeekerDoc, findByJobDoc, updateStatusDoc, removeDoc } from './application.controller.docs';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';
import { CheckOwnership } from '../auth/decorators/ownership.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @applyDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @Post()
  apply(@Body() createApplicationDto: CreateApplicationDto,
    @Req() req: Request & {
      user: { userId: number; role: UserRole; };
    },
  ) {
    const id = req.user.role === UserRole.ADMIN ? createApplicationDto.jobSeekerId : req.user.userId;

    return this.applicationsService.apply(id, createApplicationDto.jobId);
  }

  @findAllDoc()
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @findOneDoc()
  // @CheckOwnership('job.employerId', 'id') this does not work, guard is implemented in applications.service.ts
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { userId: number; role: UserRole; }; },
  ) {
    return this.applicationsService.findOne(+id, req.user);
  }

  @findBySeekerDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @CheckOwnership('seekerId')
  @Get('/seeker/:seekerId')
  findBySeeker(@Param('seekerId', ParseIntPipe) id: number) {
    return this.applicationsService.findbySeekerId(id);
  }

  @findByJobDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  // @CheckOwnership('job.employerId') this does not work, guard is implemented in applications.service.ts
  @Get('/job/:jobId')
  findByJob(@Param('jobId') id: string,
    @Req() req: Request & { user: { userId: number; role: UserRole; }; },
  ) {
    return this.applicationsService.findbyJobId(+id, req.user);
  }

  @updateStatusDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  // @CheckOwnership('job.employerId') this does not work, guard is implemented in applications.service.ts
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Req() req: Request & { user: { userId: number; role: UserRole; }; },
  ) {
    return this.applicationsService.updateStatus(id, updateStatusDto.status, req.user);
  }

  @removeDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  // @CheckOwnership('application.jobSeekerId') this does not work, guard is implemented in applications.service.ts
  @Delete(':id')
  remove(@Param('id') id: string,
    @Req() req: Request & { user: { userId: number; role: UserRole; }; },
  ) {
    return this.applicationsService.remove(+id, req.user);
  }
}
