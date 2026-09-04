import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto, UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createDoc, findAllDoc, findAroundDoc, findByEmployerDoc, findOneDoc, updateDoc, archiveDoc, removeDoc } from './job.controller.docs';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @createDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Post()
  create(@Body() createJobDto: CreateJobDto,
    @Req() req: Request & {
      user: { userId: number; role: UserRole; };
    },
  ) {
    const employerId = req.user.role === UserRole.ADMIN ? createJobDto.employerId : req.user.userId;
    return this.jobsService.create({ ...createJobDto, employerId });
  }

  @findAllDoc()
  @Get()
  @Public()
  findAll() {
    return this.jobsService.findAll();
  }

  @Public()
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

  @Public()
  @Get('/geocode')
  async testGeocode(@Query('address') address: string) {
    return await this.jobsService.geocodeAdress(address);
  }

  @Public()
  @findOneDoc()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @updateDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @archiveDoc()
  @Roles(UserRole.ADMIN)
  @Patch('/archive/:id')
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.archive(id);
  }

  @removeDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number,
    @Req() req: Request & {
      user: { userId: number; role: UserRole; };
    },
  ) {
    return this.jobsService.remove(id, req.user.userId, req.user.role);
  }

}
