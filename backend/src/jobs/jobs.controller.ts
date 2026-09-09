import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { createDoc, findAllDoc, findAroundDoc, findByEmployerDoc, findOneDoc, updateDoc, archiveDoc, removeDoc, testGeocodeDoc, findAdminDoc, increaseViewDoc } from './job.controller.docs';
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
    return this.jobsService.create( createJobDto, employerId);
  }

  @findAllDoc()
  @Public()
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @findAroundDoc()
  @Public()
  @Get('/search')
  findAround(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,) {
    return this.jobsService.findNearby(Number(lat), Number(lng), Number(radius),);
  }

  @findByEmployerDoc()
  @Public()
  @Get('/employer/:id')
  findByEmployer(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findByEmployer(id);
  }

  @testGeocodeDoc()
  @Public()
  @Get('/geocode')
  async testGeocode(@Query('commune') commune: string) {
    return await this.jobsService.geocodeAdress(commune);
  }

  @findAdminDoc()
  @Roles(UserRole.ADMIN)
  @Get('to-verify')
  findAdmin() {
    return this.jobsService.findAdmin();
  }

  @findOneDoc()
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @updateDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateJobDto: UpdateJobDto,
    @Req() req: Request & { user: { userId: number; role: UserRole; }; },
  ) {
    return this.jobsService.update(id, updateJobDto, req.user.userId, req.user.role);
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
    @Req() req: Request & {user: { userId: number; role: UserRole; }; },
  ) {
    return this.jobsService.remove(id, req.user.userId, req.user.role);
  }

  @increaseViewDoc()
  @Public()
  @Patch('views/:id')
  increaseView(@Param('id', ParseIntPipe) id: number) {
    this.jobsService.incrementView(id);
  }

}
