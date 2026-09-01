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
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller.js';


@Module({
  imports: [
    UsersModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'local' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET || 'dev-secret',
        signOptions: { expiresIn: (process.env.JWT_EXPIRATION || '1h') as StringValue },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [{
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy
  ],
  exports: [AuthService, PassportModule, LocalAuthGuard]
})

export class AuthModule { }
