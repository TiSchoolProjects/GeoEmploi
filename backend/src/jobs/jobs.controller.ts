import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto, UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get('/search')
  findAround(@Body() searchJobDto: SearchJobDto) {
    return this.jobsService.findNearby(searchJobDto.lng, searchJobDto.lat, searchJobDto.radius);
  }

  @Get('/employer:id')
  findByEmployer(@Param('id') id: string) {
    return this.jobsService.findByEmployer(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Patch(':id')
  archive(@Param('id') id: string) {
    return this.jobsService.archive(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }
}
