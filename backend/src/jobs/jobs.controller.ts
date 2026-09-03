import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto, UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createDoc, findAllDoc, findAroundDoc, findByEmployerDoc, findOneDoc, archiveDoc, removeDoc } from './job.controller.docs';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @createDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Post()
  create(@Body() createJobDto: CreateJobDto,
      @Req() req: Request & {user: {userId: number; role: UserRole;};
      },
  ) {
    const id = req.user.role === UserRole.ADMIN ? createJobDto.employerId : req.user.userId;
    return this.jobsService.create({...createJobDto, id});
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

  @archiveDoc()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.archive(id);
  }

  @removeDoc()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number,
        @Req() req: Request & {user: {userId: number; role: UserRole;};
        },
  ) {
    return this.jobsService.remove(id, req.user.userId, req.user.role);
  }

}
