import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { EmployersModule } from './employers/employers.module';
import { JobsModule } from './jobs/jobs.module';
import { SeekersModule } from './seekers/seekers.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'GeoUser',
      password: 'GeoPassword',
      database: 'GeoDB',
      entities: [User],
      autoLoadEntities: true,
      synchronize: true, //a enlever pour la prod
    }), 
    EmployersModule,
    UsersModule,
    JobsModule,
    SeekersModule,
    ApplicationsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
