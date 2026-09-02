import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto, UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

 /* @UseGuards(JwtAuthGuard)*/
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
    return this.jobsService.findNearby(searchJobDto.lat, searchJobDto.lng, searchJobDto.radius);
  }

  @Get('/employer/:id')
  findByEmployer(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findByEmployer(id);
  }

  @Get('/geocode')
  async testGeocode(@Query('address') address: string) {
    return await this.jobsService.geocodeAdress(address); 
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.archive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.remove(+id);
  }

}
