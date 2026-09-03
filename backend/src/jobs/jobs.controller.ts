import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto, UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createDoc, findAllDoc, findAroundDoc, findByEmployerDoc, findOneDoc, archiveDoc, removeDoc } from './job.controller.docs';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

 /* @UseGuards(JwtAuthGuard)*/
  @createDoc()
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @findAllDoc()
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @findAroundDoc()
  @Get('/search')
  findAround(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,) {
    return this.jobsService.findNearby(Number(lat), Number(lng), Number(radius),);
  }

  @findByEmployerDoc()
  @Get('/employer/:id')
  findByEmployer(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findByEmployer(id);
  }

  @Get('/geocode')
  async testGeocode(@Query('address') address: string) {
    return await this.jobsService.geocodeAdress(address);
  }

  @findOneDoc()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @archiveDoc()
  @Patch(':id')
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.archive(id);
  }

  @removeDoc()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.remove(+id);
  }

}
