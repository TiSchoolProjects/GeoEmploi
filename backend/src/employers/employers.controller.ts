import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
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
  @Roles(UserRole.ADMIN)
  @Patch(':id/verify')
  validate(@Param('id', ParseIntPipe) id: number) {
    return this.employersService.validate(id);
  }

  @updateDoc()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEmployerDto: UpdateEmployerDto,
      @Req() req: Request & {user: {userId: number; role: UserRole;};}, 
  ) {
      if (req.user.role !== UserRole.ADMIN && req.user.userId !== id) {
        throw new ForbiddenException("Vous ne pouvez pas modifier les informations un autre utilisateur.",);
      }
    return this.employersService.update(Number(id), updateEmployerDto);
  }

  @removeDoc()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employersService.remove(+id);
  }
}
