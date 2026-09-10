import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import {
  ChallengesService,
} from './challenges.service';

import {
  CreateChallengeDto,
} from './dto/create-challenge.dto';

import {
  UpdateChallengeDto,
} from './dto/update-challenge.dto';

import {
  Roles,
} from '../auth/decorators/role.decorator';

import {
  UserRole,
} from '../auth/roles.enum';
import { createDoc, findAllAdminDoc, hideDoc, historyDoc, recordJobViewDoc, todayDoc, updateDoc } from './challenges.controller.docs';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService:
      ChallengesService,
  ) {}

  /*
   * ADMIN
   */

  @findAllAdminDoc()
  @Roles(UserRole.ADMIN)
  @Get('admin')
  findAllAdmin() {
    return this.challengesService
      .findAllAdmin();
  }

  @createDoc()
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Body()
    dto: CreateChallengeDto,
  ) {
    return this.challengesService
      .create(dto);
  }

  @updateDoc()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateChallengeDto,
  ) {
    return this.challengesService
      .update(id, dto);
  }

  /*
   * SEEKER
   */

  @todayDoc()
  @Roles(UserRole.SEEKER)
  @Get('today')
  today(
    @Req()
    req: Request & {
      user: {
        userId: number;
        role: UserRole;
      };
    },
  ) {
    return this.challengesService
      .today(
        req.user.userId,
      );
  }

  @historyDoc()
  @Roles(UserRole.SEEKER)
  @Get('history')
  history(
    @Req()
    req: Request & {
      user: {
        userId: number;
        role: UserRole;
      };
    },
  ) {
    return this.challengesService
      .history(
        req.user.userId,
      );
  }

  @recordJobViewDoc()
  @Roles(UserRole.SEEKER)
  @Post('today/jobs/:jobId')
  recordJobView(
    @Param(
      'jobId',
      ParseIntPipe,
    )
    jobId: number,

    @Req()
    req: Request & {
      user: {
        userId: number;
        role: UserRole;
      };
    },
  ) {
    return this.challengesService
      .recordJobView(
        req.user.userId,
        jobId,
      );
  }

  @hideDoc()
  @Roles(UserRole.SEEKER)
  @Patch('hide/permanently')
  hide(
    @Req()
    req: Request & {
      user: {
        userId: number;
        role: UserRole;
      };
    },
  ) {
    return this.challengesService
      .hide(
        req.user.userId,
      );
  }
}
