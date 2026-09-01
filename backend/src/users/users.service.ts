import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
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

  findbyEmail(email: string) {
    return this.UserRepository.findOneBy({email});
  }

  findOne(id: number) {
    return this.UserRepository.findOneBy({id});
  }

  async UpdateStatus(id: number, status: UserStatus): Promise<User> {
    const user = await this.UserRepository.findOne({where: {id}});

    if (!user) {
      throw new NotFoundException("Candidature non trouvée.");
    }

    user.status = status;
    return this.UserRepository.save(user);
  }

  remove(id: number) {
    return this.UserRepository.delete({id});
  }
}
