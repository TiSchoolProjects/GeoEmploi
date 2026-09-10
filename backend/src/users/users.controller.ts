import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { createDoc, findAllDoc, findOneDoc, updateStatusDoc, updateDoc, removeDoc, createAdminDoc } from './user.controller.doc';
import { UpdateStatusDto, UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';
import { CheckOwnership } from '../auth/decorators/ownership.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @createDoc()
  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @createAdminDoc()
  @Roles(UserRole.ADMIN)
  @Post('admin')
  createAdmin(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createAdmin(
      createUserDto,
    );
  }

  @findAllDoc()
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @findOneDoc()
  @CheckOwnership('id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @updateStatusDoc()
  @Roles(UserRole.ADMIN)
  @Patch('/status/:id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.usersService.UpdateStatus(id, updateStatusDto);
  }

  @updateDoc()
  @CheckOwnership('id')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.UpdateUser(id, updateUserDto);
  }

  @removeDoc()
  @CheckOwnership('id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
