import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole, UserStatus } from './src/users/entities/user.entity';
import { Employer } from './src/employers/entities/employer.entity';
import { Seeker } from './src/seekers/entities/seeker.entity';
import { Job, GeoCodingStatus } from './src/jobs/entities/job.entity';
import { Application } from './src/applications/entities/application.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Employer, Seeker, Job, Application],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const employerRepository = dataSource.getRepository(Employer);
  const seekerRepository = dataSource.getRepository(Seeker);
  const jobRepository = dataSource.getRepository(Job);

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  let employerUser = await userRepository.findOne({
    where: { email: 'employer@demo.fr' },
  });

  if (!employerUser) {
    employerUser = await userRepository.save({
      email: 'employer@demo.fr',
      password: await bcrypt.hash('Demo123!', saltRounds),
      username: 'Demo Employer',
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE,
    });
  }

  let employer = await employerRepository.findOne({
    where: { userId: employerUser.id },
  });

  if (!employer) {
    employer = await employerRepository.save({
      userId: employerUser.id,
      companyName: 'GeoEmploi Demo',
      companyDesc: 'Entreprise de démonstration pour GeoEmploi.',
      verifiedAt: new Date(),
    });
  }

  let seekerUser = await userRepository.findOne({
    where: { email: 'seeker@demo.fr' },
  });

  if (!seekerUser) {
    seekerUser = await userRepository.save({
      email: 'seeker@demo.fr',
      password: await bcrypt.hash('Demo123!', saltRounds),
      username: 'Demo Seeker',
      role: UserRole.SEEKER,
      status: UserStatus.ACTIVE,
    });
  }

  let seeker = await seekerRepository.findOne({
    where: { userId: seekerUser.id },
  });

  if (!seeker) {
    await seekerRepository.save({
      userId: seekerUser.id,
      skills: ['TypeScript', 'NestJS', 'React', 'PostgreSQL'],
      experience: '2 years',
      availability: 'Immediately',
    });
  }

  let job = await jobRepository.findOne({
    where: {
      title: 'Développeur Fullstack - Démo',
      employerId: employerUser.id,
    },
  });

  if (!job) {
    await jobRepository.save({
      employerId: employerUser.id,
      title: 'Développeur Fullstack - Démo',
      description:
        'Nous recherchons un développeur Fullstack pour travailler sur une application web avec NestJS, React et PostgreSQL.',
      adress: 'Paris, France',
      lat: 48.8566,
      lng: 2.3522,
      geocodingSource: 'demo',
      geocodingScore: 1,
      geocodedAt: new Date(),
      GeocodingStatus: GeoCodingStatus.VALID,
      archivedAt: null,
    });
  }

  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
