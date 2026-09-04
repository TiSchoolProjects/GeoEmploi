import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SeekersService } from './seekers.service';
import { CreateSeekerDto } from './dto/create-seeker.dto';
import { UpdateSeekerDto } from './dto/update-seeker.dto';
import { createDoc, findAllDoc, findOneDoc, updateDoc, removeDoc, } from './seekers.controller.doc'
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';
import { Req, ForbiddenException } from '@nestjs/common';

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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSeekerDto: UpdateSeekerDto,
      @Req() req: Request & {user: {userId: number; role: UserRole;};}, 
  ) {
      if (req.user.role !== UserRole.ADMIN && req.user.userId !== id) {
        throw new ForbiddenException("Vous ne pouvez pas modifier les informations un autre utilisateur.",);
      }
    return this.seekersService.update(Number(id), updateSeekerDto);
  }

  @removeDoc()
  @Roles(UserRole.ADMIN, UserRole.SEEKER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seekersService.remove(+id);
  }
}
