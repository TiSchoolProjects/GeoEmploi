import { Injectable } from '@nestjs/common';
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

  remove(userId: number) {
    return this.employerRepository.delete({ userId });
  }
}
