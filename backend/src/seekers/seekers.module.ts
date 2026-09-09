import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeekersController } from './seekers.controller';
import { SeekersService } from './seekers.service';
import { Seeker } from './entities/seeker.entity';
import { User } from '../users/entities/user.entity';
import { ChallengesModule } from '../challenges/challenges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Seeker,
      User,
    ]),
    ChallengesModule,
  ],

  controllers: [
    SeekersController,
  ],

  providers: [
    SeekersService,
  ],

  exports: [
    SeekersService,
  ],
})
export class SeekersModule {}
