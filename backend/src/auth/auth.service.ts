import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { RegisterSeekerDto } from './dto/register-seeker.dto.js';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Seeker } from '../seekers/entities/seeker.entity.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { ConflictException } from '@nestjs/common';
import { Employer } from '../employers/entities/employer.entity.js';
import { RegisterEmployerDto } from './dto/register-employer.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findbyEmail(username);
    if (user && await compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerSeeker(data: RegisterSeekerDto) {
    return this.dataSource.transaction(async(manager) => {
      const exist = await manager.findOne(User, {where: {email: data.email}})

      if (exist) {
        throw new ConflictException("Un compte existe déja pour cette adresse email.")
      }

      const pwd = await hash(data.password, 10);

      const user = manager.create(User, {
        username: data.username,
        email: data.email,
        password: pwd,
        role: UserRole.SEEKER,
      });

      const userSaved = await manager.save(User, user);

      const seeker = manager.create(Seeker, {
        userId: userSaved.id,
        skills: data.skills,
        experience: data.experience,
        availability: data.availability,
      });

      const seekerSaved = await manager.save(Seeker, seeker);

      return { message: 'Compte Chercheur créé avec succès.', 
        user: {id: userSaved.id, username: userSaved.username, email: userSaved.email, },
        seeker: seekerSaved,
      };
    });
  }

  async registerEmployer(data: RegisterEmployerDto) {
    return this.dataSource.transaction(async(manager) => {
      const exist = await manager.findOne(User, {where: {email: data.email}})

      if (exist) {
        throw new ConflictException("Un compte existe déja pour cette adresse email.")
      }

      const pwd = await hash(data.password, 10);

      const user = manager.create(User, {
        username: data.username,
        email: data.email,
        password: pwd,
        role: UserRole.EMPLOYER,
      });

      const userSaved = await manager.save(User, user);

      const employer = manager.create(Employer, {
        userId: userSaved.id,
        companyName: data.companyName,
        companyDesc: data.companyDesc,
      });

      const employerSaved = await manager.save(Employer, employer);

      return { message: 'Compte Employeur créé avec succès.', 
        user: {id: userSaved.id, username: userSaved.username, email: userSaved.email, },
        emplyer: employerSaved,
      };
    });

  }
}
