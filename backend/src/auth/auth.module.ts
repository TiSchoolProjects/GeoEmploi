import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { User } from '../users/entities/user.entity.js';
import { UsersModule } from '../users/users.module.js';
import { Seeker } from '../seekers/entities/seeker.entity.js';
import { Employer } from '../employers/entities/employer.entity.js';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { LocalStrategy } from './local.strategy.js';
import { LocalAuthGuard } from './local-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { OwnershipGuard } from './ownership.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Seeker, Employer]),
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
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnershipGuard,
    },
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy
  ],
  exports: [AuthService, PassportModule, LocalAuthGuard]
})

export class AuthModule { }
