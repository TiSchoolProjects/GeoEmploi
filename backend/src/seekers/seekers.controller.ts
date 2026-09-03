import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeekersService } from './seekers.service';
import { CreateSeekerDto } from './dto/create-seeker.dto';
import { UpdateSeekerDto } from './dto/update-seeker.dto';
import { createDoc, findAllDoc, findOneDoc, updateDoc, removeDoc } from './seekers.controller.doc'
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('seekers')
export class SeekersController {
  constructor(private readonly seekersService: SeekersService) {}

  @createDoc()
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSeekerDto: CreateSeekerDto) {
    return this.seekersService.create(createSeekerDto);
  }

  @findAllDoc()
  @Get()
  findAll() {
    return this.seekersService.findAll();
  }

  @findOneDoc()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seekersService.findOne(+id);
  }

  @updateDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeekerDto: UpdateSeekerDto) {
    return this.seekersService.update(Number(id), updateSeekerDto);
  }

  @removeDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seekersService.remove(+id);
  }
}
