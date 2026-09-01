import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employer } from './entities/employer.entity';

@Injectable()
export class EmployersService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
  ) {}

  async create(data: Partial<Employer>) {
    const employer = this.employerRepository.create(data);
    return this.employerRepository.save(employer);
  }

  findAll() {
    return this.employerRepository.find({ relations: {user:true}});
  }

  findOne(userId: number) {
    return this.employerRepository.findOne({where: { userId }, relations: {user: true}});
  }

  async validate(userId: number): Promise<Employer> {
    const acc = await this.employerRepository.findOne({where: {userId}});

    if (!acc) {
      throw new NotFoundException("Compte non trouvé.");
    }

    acc.verifiedAt = new Date();

    return await this.employerRepository.save(acc);
  } 

  remove(userId: number) {
    return this.employerRepository.delete({ userId });
  }
}
