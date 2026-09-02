import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';
import { applyDoc, findAllDoc, findOneDoc, findBySeekerDoc, findByJobDoc, updateStatusDoc, removeDoc } from './application.controller.docs';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @applyDoc()
  @Post()
  apply(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.apply(createApplicationDto.jobSeekerId, createApplicationDto.jobId);
  }

  @findAllDoc()
  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @findOneDoc()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(+id);
  }

  @findBySeekerDoc()
  @Get('/seeker/:seekerId')
  findBySeeker(@Param('seekerId') id: string) {
    return this.applicationsService.findbySeekerId(+id);
  }

  @findByJobDoc()
  @Get('/job/:jobId')
  findByJob(@Param('jobId') id: string) {
    return this.applicationsService.findbyJobId(+id);
  }

  @updateStatusDoc()
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.UpdateStatus(id, updateStatusDto.status);
  }

  @removeDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(+id);
  }
}
