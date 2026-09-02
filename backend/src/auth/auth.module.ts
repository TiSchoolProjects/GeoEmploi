import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy.js';
import { LocalStrategy } from './local.strategy.js';
import { LocalAuthGuard } from './local-auth.guard.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { APP_GUARD } from '@nestjs/core';
import { StringValue } from 'ms';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { User } from '../users/entities/user.entity.js';
import { Seeker } from '../seekers/entities/seeker.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Seeker]),
    UsersModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'local' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: { expiresIn: configService.get<StringValue>('auth.jwtExpiration') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
  //{
  //  provide: APP_GUARD,
  //  useClass: JwtAuthGuard,
  //},
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy
  ],
  exports: [AuthService, PassportModule, LocalAuthGuard]
})

export class AuthModule { }
