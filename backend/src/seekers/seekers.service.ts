import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSeekerDto } from './dto/update-seeker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeker } from './entities/seeker.entity';
import { Repository } from 'typeorm';
import { ChallengesService } from '../challenges/challenges.service';

@Injectable()
export class SeekersService {
  constructor(
    @InjectRepository(Seeker)
    private seekerRepository: Repository<Seeker>,
    private readonly challengesService: ChallengesService,
  ) {}

  async create(data: Partial<Seeker>) {
    const seeker = this.seekerRepository.create(data);
    return await this.seekerRepository.save(seeker);
  }

  async findAll() {
    return await this.seekerRepository.find();
  }

  async findOne(userId: number) {
    const seeker = await this.seekerRepository.findOne({ where: { userId }, relations: { user: true } });

    if (!seeker) {
      throw new NotFoundException("Rechercheur d'emploi non trouvé.");
    }

    return seeker;
  }

  async update(userId: number, updateSeekerDto: UpdateSeekerDto) {
    const seeker = await this.seekerRepository.findOne({ where: { userId,},});

    if (!seeker) {
      throw new NotFoundException("Rechercheur d'emploi non trouvé.",);
    }

    const oldSkills = [...(seeker.skills ?? [])].sort();

    const newSkills = updateSeekerDto.skills !== undefined ? [...updateSeekerDto.skills].sort() : oldSkills;

    const skillsChanged = JSON.stringify(oldSkills) !== JSON.stringify(newSkills);

    Object.assign(seeker, updateSeekerDto,);

    const saved = await this.seekerRepository.save(seeker);

    if (skillsChanged) {
      await this.challengesService.recordSkillUpdate(userId,);
    }

    return saved;
  }

  async remove(userId: number) {
    return this.seekerRepository.delete({ userId });
  }
}
