import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { EmployersService } from './employers.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { createDoc, findAllDoc, findOneDoc, validateDoc, updateDoc, removeDoc } from './employers.controller.docs';
import { UpdateEmployerDto } from './dto/update-employer.dto';

@Controller('employers')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @createDoc()
  @Post()
  create(@Body() createEmployerDto: CreateEmployerDto) {
    return this.employersService.create(createEmployerDto);
  }

  @findAllDoc()
  @Get()
  findAll() {
    return this.employersService.findAll();
  }

  @findOneDoc()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employersService.findOne(+id);
  }

  @validateDoc()
  @Patch(':id/verify')
  validate(@Param('id', ParseIntPipe) id: number) {
    return this.employersService.validate(id);
  }

  @updateDoc()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployerDto: UpdateEmployerDto) {
    return this.employersService.update(Number(id), updateEmployerDto);
  }

  @removeDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employersService.remove(+id);
  }
}
