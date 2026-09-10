import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UpdateStatusDto, UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../auth/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private configService: ConfigService
  ) { }

  async create(data: Partial<User>) {
    const pwdhashed = await hash(data.password!, this.configService.get<number>('auth.saltRounds')!);
    const user = this.UserRepository.create({ ...data, password: pwdhashed });
    return this.UserRepository.save(user);
  }

  async createAdmin(createUserDto: CreateUserDto) {
    const exist = await this.UserRepository.findOne({where: {email: createUserDto.email}});

    if (exist) {
      throw new ConflictException('Adresse email déjà utilisée.',);
    }
    
    const created = await this.create({...createUserDto, role: UserRole.ADMIN});
    const {password: _password, ...safeUser} = created;
    return safeUser;
  }

  findAll() {
    return this.UserRepository.find();
  }

  findbyEmail(email: string) {
    return this.UserRepository.createQueryBuilder('user').addSelect('user.password').where('user.email = :email', { email }).getOne();
  }

  findOne(id: number) {
    return this.UserRepository.findOneBy({ id });
  }

  async UpdateStatus(id: number, data: UpdateStatusDto): Promise<User> {
    const user = await this.UserRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé.");
    }

    user.status = data.status;
    return await this.UserRepository.save(user);
  }

  async UpdateUser(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.UserRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé.");
    }

    const taken = await this.UserRepository.findOne({
      where: { email: data.email, id: Not(id), },
    });

    if (taken) {
      throw new ConflictException("Adresse email déjà utilisée.");
    }

    Object.assign(user, data);

    return await this.UserRepository.save(user);

  }

  remove(id: number) {
    return this.UserRepository.delete({ id });
  }

  async updateLoginDate(id: number): Promise<void> {
    const result = await this.UserRepository.update(
      { id },
      { lastLogin: new Date() },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
  }

  async removeAfter2Years(): Promise<number> {
    const dateLim = new Date();
    dateLim.setFullYear(dateLim.getFullYear() - 2);

    const res = await this.UserRepository.delete([
      { lastLogin: LessThanOrEqual(dateLim) },
      { lastLogin: IsNull(), createdAt: LessThanOrEqual(dateLim) },
    ]);

    return res.affected ?? 0;
  }
}
