import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe, Headers, UnauthorizedException } from '@nestjs/common';
import { EmployersService } from './employers.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { createDoc, findAllDoc, findOneDoc, validateDoc, updateDoc, removeDoc } from './employers.controller.docs';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('employers')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) { }

  @createDoc()
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createEmployerDto: CreateEmployerDto) {
    return this.employersService.create(createEmployerDto);
  }

  @findAllDoc()
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.employersService.findAll();
  }

  @findOneDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employersService.findOne(+id);
  }

  @validateDoc()
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employersService.remove(+id);
  }
  /*
  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    console.log('Extracted Token:', token);

    return this.employersService.remove(+id);
  }
  */
}
