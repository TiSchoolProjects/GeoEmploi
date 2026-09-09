import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { In, MoreThanOrEqual, Repository, IsNull } from 'typeorm';

import { Challenge, ChallengeType } from './entities/challenge.entity';

import { ChallengeProgress } from './entities/challenge-progress.entity';

import { ChallengeJobView } from './entities/challenge-job-view.entity';

import { Seeker } from '../seekers/entities/seeker.entity';

import { Job } from '../jobs/entities/job.entity';

import { CreateChallengeDto } from './dto/create-challenge.dto';

import { UpdateChallengeDto } from './dto/update-challenge.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,

    @InjectRepository(ChallengeProgress)
    private readonly progressRepository: Repository<ChallengeProgress>,

    @InjectRepository(ChallengeJobView)
    private readonly jobViewRepository: Repository<ChallengeJobView>,

    @InjectRepository(Seeker)
    private readonly seekerRepository: Repository<Seeker>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}
 
  private getParisDate(): string {
    const parts =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone: 'Europe/Paris',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        },
      ).formatToParts(new Date());

    const values = Object.fromEntries(parts.map((part) => [ part.type, part.value ]),);

    return ( `${values.year}-` + `${values.month}-` + `${values.day}`);
  }

  private getDateDaysAgo(days: number): string {
    const today = this.getParisDate();

    const [year, month, day] = today.split('-').map(Number);

    const date = new Date(Date.UTC(year, month - 1, day,),);

    date.setUTCDate( date.getUTCDate() - days,);

    return date.toISOString().slice(0, 10);
  }

  private async getSeeker(userId: number): Promise<Seeker> {
    const seeker = await this.seekerRepository.findOne({ where: {userId,},});

    if (!seeker) {
      throw new NotFoundException("Rechercheur d'emploi non trouvé.");
    }

    return seeker;
  }

  private async getTodayChallenge(): Promise<Challenge | null> {
    return this.challengeRepository.findOne({ where: { scheduledDate: this.getParisDate(), active: true,},});
  }

  private buildResponse(challenge: Challenge, progress: ChallengeProgress | null,) {
    const current = progress?.progress ?? 0;

    return {
      id: challenge.id,

      title:
        challenge.title,

      description:
        challenge.description,

      type:
        challenge.type,

      target:
        challenge.target,

      scheduledDate:
        challenge.scheduledDate,

      progress: current,

      completed:
        current >=
        challenge.target,

      completedAt:
        progress?.completedAt ??
        null,
    };
  }

  async today(
    userId: number,
  ) {
    const seeker =
      await this.getSeeker(userId);

    if (seeker.challengesHidden) {
      return {
        hidden: true,
        challenge: null,
      };
    }

    const challenge =
      await this.getTodayChallenge();

    if (!challenge) {
      return {
        hidden: false,
        challenge: null,
      };
    }

    const progress =
      await this.progressRepository
        .findOne({
          where: {
            userId,
            challengeId:
              challenge.id,
          },
        });

    return {
      hidden: false,

      challenge:
        this.buildResponse(
          challenge,
          progress,
        ),
    };
  }

  async recordJobView(
    userId: number,
    jobId: number,
  ) {
    const seeker =
      await this.getSeeker(userId);

    if (seeker.challengesHidden) {
      return {
        hidden: true,
        challenge: null,
      };
    }

    const challenge =
      await this.getTodayChallenge();

    if (
      !challenge ||
      challenge.type !==
        ChallengeType.VIEW_JOBS
    ) {
      return this.today(userId);
    }

    const job =
      await this.jobRepository
        .findOne({
          where: {
            id: jobId,
            archivedAt: IsNull(),
          },
        });

    if (!job) {
      throw new NotFoundException(
        'Offre non trouvée.',
      );
    }

    const existing =
      await this.jobViewRepository
        .findOne({
          where: {
            userId,
            challengeId:
              challenge.id,
            jobId,
          },
        });

    if (!existing) {
      try {
        await this.jobViewRepository
          .save(
            this.jobViewRepository
              .create({
                userId,
                challengeId:
                  challenge.id,
                jobId,
              }),
          );
      } catch (error: any) {
        /**
         * PostgreSQL unique violation.
         * Si deux requêtes arrivent en même temps,
         * on ne compte quand même qu'une fois.
         */
        if (
          error?.code !== '23505'
        ) {
          throw error;
        }
      }
    }

    const count =
      await this.jobViewRepository
        .count({
          where: {
            userId,
            challengeId:
              challenge.id,
          },
        });

    let progress =
      await this.progressRepository
        .findOne({
          where: {
            userId,
            challengeId:
              challenge.id,
          },
        });

    if (!progress) {
      progress =
        this.progressRepository
          .create({
            userId,
            challengeId:
              challenge.id,

            progress: 0,

            completedAt: null,
          });
    }

    progress.progress =
      Math.min(
        count,
        challenge.target,
      );

    if (
      progress.progress >=
        challenge.target &&
      !progress.completedAt
    ) {
      progress.completedAt =
        new Date();
    }

    await this.progressRepository
      .save(progress);

    return this.today(userId);
  }

  async recordSkillUpdate(
    userId: number,
  ) {
    const seeker =
      await this.getSeeker(userId);

    if (seeker.challengesHidden) {
      return;
    }

    const challenge =
      await this.getTodayChallenge();

    if (
      !challenge ||
      challenge.type !==
        ChallengeType.UPDATE_SKILL
    ) {
      return;
    }

    let progress =
      await this.progressRepository
        .findOne({
          where: {
            userId,
            challengeId:
              challenge.id,
          },
        });

    if (!progress) {
      progress =
        this.progressRepository
          .create({
            userId,
            challengeId:
              challenge.id,

            progress: 0,

            completedAt: null,
          });
    }

    progress.progress =
      challenge.target;

    if (!progress.completedAt) {
      progress.completedAt =
        new Date();
    }

    await this.progressRepository
      .save(progress);
  }

  async history(
    userId: number,
  ) {
    const seeker =
      await this.getSeeker(userId);

    if (seeker.challengesHidden) {
      return {
        hidden: true,
        challenges: [],
      };
    }

    const minDate =
      this.getDateDaysAgo(29);

    const challenges =
      await this.challengeRepository
        .find({
          where: {
            scheduledDate:
              MoreThanOrEqual(
                minDate,
              ),

            active: true,
          },

          order: {
            scheduledDate:
              'DESC',
          },
        });

    if (
      challenges.length === 0
    ) {
      return {
        hidden: false,
        challenges: [],
      };
    }

    const ids =
      challenges.map(
        (challenge) =>
          challenge.id,
      );

    const progresses =
      await this.progressRepository
        .find({
          where: {
            userId,
            challengeId:
              In(ids),
          },
        });

    const byChallenge =
      new Map(
        progresses.map(
          (progress) => [
            progress.challengeId,
            progress,
          ],
        ),
      );

    return {
      hidden: false,

      challenges:
        challenges.map(
          (challenge) =>
            this.buildResponse(
              challenge,
              byChallenge.get(
                challenge.id,
              ) ?? null,
            ),
        ),
    };
  }

  async hide(
    userId: number,
  ) {
    const seeker =
      await this.getSeeker(userId);

    seeker.challengesHidden =
      true;

    await this.seekerRepository
      .save(seeker);

    return {
      hidden: true,
    };
  }

  async findAllAdmin() {
    return this.challengeRepository
      .find({
        order: {
          scheduledDate:
            'DESC',
        },
      });
  }

  async create(
    dto: CreateChallengeDto,
  ) {
    if (
      dto.type ===
        ChallengeType.UPDATE_SKILL &&
      dto.target !== 1
    ) {
      throw new BadRequestException(
        'Un défi de mise à jour de compétence doit avoir un objectif de 1.',
      );
    }

    try {
      const challenge =
        this.challengeRepository
          .create({
            ...dto,

            active:
              dto.active ?? true,
          });

      return await this
        .challengeRepository
        .save(challenge);
    } catch (error: any) {
      if (
        error?.code === '23505'
      ) {
        throw new ConflictException(
          'Un défi existe déjà pour cette date.',
        );
      }

      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateChallengeDto,
  ) {
    const challenge =
      await this.challengeRepository
        .findOne({
          where: {
            id,
          },
        });

    if (!challenge) {
      throw new NotFoundException(
        'Défi non trouvé.',
      );
    }

    const nextType =
      dto.type ??
      challenge.type;

    const nextTarget =
      dto.target ??
      challenge.target;

    if (
      nextType ===
        ChallengeType.UPDATE_SKILL &&
      nextTarget !== 1
    ) {
      throw new BadRequestException(
        'Un défi de mise à jour de compétence doit avoir un objectif de 1.',
      );
    }

    Object.assign(
      challenge,
      dto,
    );

    try {
      return await this
        .challengeRepository
        .save(challenge);
    } catch (error: any) {
      if (
        error?.code === '23505'
      ) {
        throw new ConflictException(
          'Un défi existe déjà pour cette date.',
        );
      }

      throw error;
    }
  }
}
