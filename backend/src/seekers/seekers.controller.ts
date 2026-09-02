import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeekersService } from './seekers.service';
import { CreateSeekerDto } from './dto/create-seeker.dto';
import { UpdateSeekerDto } from './dto/update-seeker.dto';
import { createDoc, findAllDoc, findOneDoc, updateDoc, removeDoc } from './seekers.controller.doc'

@Controller('seekers')
export class SeekersController {
  constructor(private readonly seekersService: SeekersService) {}

  @createDoc()
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeekerDto: UpdateSeekerDto) {
    return this.seekersService.update(Number(id), updateSeekerDto);
  }

  @removeDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seekersService.remove(+id);
  }
}
