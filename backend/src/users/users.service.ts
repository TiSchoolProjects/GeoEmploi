import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>) {
    const user = this.UserRepository.create(data);
    return this.UserRepository.save(user);
  }

  findAll() {
    return this.UserRepository.find();
  }

  findOne(id: number) {
    return this.UserRepository.findOneBy({id});
  }

  remove(id: number) {
    return this.UserRepository.delete({id});
  }
}
