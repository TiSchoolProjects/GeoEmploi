import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  ChallengesController,
} from './challenges.controller';

import {
  ChallengesService,
} from './challenges.service';

import {
  Challenge,
} from './entities/challenge.entity';

import {
  ChallengeProgress,
} from './entities/challenge-progress.entity';

import {
  ChallengeJobView,
} from './entities/challenge-job-view.entity';

import {
  Seeker,
} from '../seekers/entities/seeker.entity';

import {
  Job,
} from '../jobs/entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challenge,
      ChallengeProgress,
      ChallengeJobView,
      Seeker,
      Job,
    ]),
  ],

  controllers: [
    ChallengesController,
  ],

  providers: [
    ChallengesService,
  ],

  exports: [
    ChallengesService,
  ],
})
export class ChallengesModule {}
