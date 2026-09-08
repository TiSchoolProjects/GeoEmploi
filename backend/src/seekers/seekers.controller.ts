import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SeekersService } from './seekers.service';
import { CreateSeekerDto } from './dto/create-seeker.dto';
import { UpdateSeekerDto } from './dto/update-seeker.dto';
import { createDoc, findAllDoc, findOneDoc, updateDoc, removeDoc, } from './seekers.controller.doc'
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';
import { CheckOwnership } from '../auth/decorators/ownership.decorator';

@Controller('seekers')
export class SeekersController {
  constructor(private readonly seekersService: SeekersService) { }

  @createDoc()
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSeekerDto: CreateSeekerDto) {
    return this.seekersService.create(createSeekerDto);
  }

  @findAllDoc()
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.seekersService.findAll();
  }

  @findOneDoc()
  @CheckOwnership('id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seekersService.findOne(+id);
  }

  @updateDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @CheckOwnership('id')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSeekerDto: UpdateSeekerDto) {
    return this.seekersService.update(Number(id), updateSeekerDto);
  }

  @removeDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @CheckOwnership('id')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seekersService.remove(+id);
  }
}
