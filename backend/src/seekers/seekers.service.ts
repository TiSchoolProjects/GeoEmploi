import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeekerDto } from './dto/create-seeker.dto';
import { UpdateSeekerDto } from './dto/update-seeker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeker } from './entities/seeker.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeekersService {
  constructor(
    @InjectRepository(Seeker)
    private seekerRepository: Repository<Seeker>
  ) {}

  async create(data: Partial<Seeker>) {
    const seeker = this.seekerRepository.create(data);
    return await this.seekerRepository.save(seeker);
  }

  async findAll() {
    return await this.seekerRepository.find();
  }

  async findOne(userId: number) {
    const seeker = await this.seekerRepository.findOne({where: {userId}});

    if (!seeker) {
      throw new NotFoundException("Rechercheur d'emploi non trouvé.");
    }

    return seeker;
  }

  async update(userId: number, updateSeekerDto: UpdateSeekerDto) {
    const seeker = await this.seekerRepository.findOne({where: {userId}});

    if (!seeker) {
      throw new NotFoundException("Rechercheur d'emploi non trouvé.");
    }
    Object.assign(seeker, updateSeekerDto);
    return await this.seekerRepository.save(seeker);
  }

  remove(userId: number) {
    return this.seekerRepository.delete({userId});
  }
}
