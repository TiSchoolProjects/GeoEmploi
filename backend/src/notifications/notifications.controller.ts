import { Controller, Get, Patch, Param, Req, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../auth/roles.enum';
import { findMeDoc, markReadDoc, nbrUnreadDoc } from './notifications.controller.docs';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {} 

  @findMeDoc()
  @Roles(UserRole.EMPLOYER)
  @Get()
  findMe(@Req() req: Request & {user: {userId: number; role:UserRole;};},) {
    return this.notificationsService.findMe(req.user.userId);
  }

  @nbrUnreadDoc()
  @Roles(UserRole.EMPLOYER)
  @Get('nbrUnread')
  nbrUnread(@Req() req: Request & {user: {userId: number; role:UserRole;};},) {
    return this.notificationsService.nbrUnread(req.user.userId);
  }

  @markReadDoc()
  @Roles(UserRole.EMPLOYER)
  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number,
    @Req() req: Request & {user: {userId: number; role:UserRole;};},) {
    return this.notificationsService.markRead(id, req.user.userId);
  }
}
