import { Module } from '@nestjs/common';
import { SeekersService } from './seekers.service';
import { SeekersController } from './seekers.controller';
import { Seeker } from './entities/seeker.entity';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [SeekersController],
  providers: [SeekersService],
  imports: [TypeOrmModule.forFeature([Seeker, User])],
  exports: [TypeOrmModule]

})
export class SeekersModule {}
