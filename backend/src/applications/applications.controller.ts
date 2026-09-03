import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';
import { applyDoc, findAllDoc, findOneDoc, findBySeekerDoc, findByJobDoc, updateStatusDoc, removeDoc } from './application.controller.docs';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @applyDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @Post()
  apply(@Body() createApplicationDto: CreateApplicationDto,
        @Req() req: Request & {user: {userId: number; role: UserRole;};
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
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(+id);
  }

  @findBySeekerDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @Get('/seeker/:seekerId')
  findBySeeker(@Param('seekerId') id: string) {
    return this.applicationsService.findbySeekerId(+id);
  }

  @findByJobDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Get('/job/:jobId')
  findByJob(@Param('jobId') id: string) {
    return this.applicationsService.findbyJobId(+id);
  }

  @updateStatusDoc()
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.UpdateStatus(id, updateStatusDto.status);
  }

  @removeDoc()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(+id);
  }
}
