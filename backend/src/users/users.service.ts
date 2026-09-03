import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UpdateStatusDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private configService: ConfigService
  ) {}

  async create(data: Partial<User>) {
    const pwdhashed = await hash(data.password!, this.configService.get<number>('auth.saltRounds')!);
    const user = this.UserRepository.create({...data, password: pwdhashed});
    return this.UserRepository.save(user);
  }

  findAll() {
    return this.UserRepository.find();
  }

  findbyEmail(email: string) {
    return this.UserRepository.createQueryBuilder('user').addSelect('user.password').where('user.email = :email', {email}).getOne();
  }

  findOne(id: number) {
    return this.UserRepository.findOneBy({id});
  }

  async UpdateStatus(id: number, data: UpdateStatusDto): Promise<User> {
    const user = await this.UserRepository.findOne({where: {id}});

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvée.");
    }

    user.status = data.status;
    return await this.UserRepository.save(user);
  }

  async UpdateUser(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.UserRepository.findOne({where: {id}});

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvée.");
    }
    if (data.firstname) {
      user.firstname = data.firstname;
    }
    if (data.lastname) {
      user.lastname = data.lastname;
    } 
    if (data.email) {
      user.email = data.email;
    }

    return await this.UserRepository.save(user);

  }

  remove(id: number) {
    return this.UserRepository.delete({id});
  }
}
