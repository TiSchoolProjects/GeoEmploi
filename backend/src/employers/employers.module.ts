import { Module } from '@nestjs/common';
import { EmployersService } from './employers.service';
import { EmployersController } from './employers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employer } from './entities/employer.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employer, User])],
  controllers: [EmployersController],
  providers: [EmployersService],
  exports: [TypeOrmModule],
})
export class EmployersModule {}
