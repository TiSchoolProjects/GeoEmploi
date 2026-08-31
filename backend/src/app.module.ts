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

@Module({
  imports: [ TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'admin',
      password: 'adminpassword',
      database: 'geoemploi_test',
      entities: [User],
      autoLoadEntities: true,
      synchronize: true, //a enlever pour la prod
    }), 
    EmployersModule,
    UsersModule,
    JobsModule,
    SeekersModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
