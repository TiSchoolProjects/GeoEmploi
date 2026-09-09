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

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService:
      ChallengesService,
  ) {}

  /*
   * ADMIN
   */

  @Roles(UserRole.ADMIN)
  @Get('admin')
  findAllAdmin() {
    return this.challengesService
      .findAllAdmin();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Body()
    dto: CreateChallengeDto,
  ) {
    return this.challengesService
      .create(dto);
  }

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
