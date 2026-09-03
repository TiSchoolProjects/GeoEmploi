import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { createDoc, findAllDoc, findOneDoc, findbyEmailDoc, updateDoc, removeDoc } from './user.controller.doc';
import { UserStatus } from './entities/user.entity';
import { UpdateStatusDto, UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @createDoc()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @findAllDoc()
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @findOneDoc()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @findbyEmailDoc()
  @Get('/email/:id')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findbyEmail(email);
  }

  @updateDoc()
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
      return this.usersService.UpdateUser(id, updateUserDto);
    }

  @removeDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
