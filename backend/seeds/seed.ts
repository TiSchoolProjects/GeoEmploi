import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from '../src/users/entities/user.entity';
import { Employer } from '../src/employers/entities/employer.entity';
import { Seeker } from '../src/seekers/entities/seeker.entity';
import { Job, GeoCodingStatus } from '../src/jobs/entities/job.entity';
import { Application } from '../src/applications/entities/application.entity';
import { UserRole } from '../src/auth/roles.enum';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Employer, Seeker, Job, Application],
  synchronize: false,
});

async function seed() {
  console.log('Seed GeoEmploi...');

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const employerRepository = dataSource.getRepository(Employer);
  const seekerRepository = dataSource.getRepository(Seeker);
  const jobRepository = dataSource.getRepository(Job);

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  /*
   * ADMIN
   */
  let admin = await userRepository.findOne({
    where: { email: 'admin@geoemploi.fr' },
  });

  if (!admin) {
    admin = await userRepository.save({
      email: 'admin@geoemploi.fr',
      password: await bcrypt.hash('Admin123!', saltRounds),
      firstname: 'Claire',
      lastname: 'Martin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    console.log(`Admin créé : ${admin.email}`);
  } else {
    console.log(`Admin déjà présent : ${admin.email}`);
  }

  /*
   * EMPLOYER
   */
  let employerUser = await userRepository.findOne({
    where: { email: 'recrutement@novatech.fr' },
  });

  if (!employerUser) {
    employerUser = await userRepository.save({
      email: 'recrutement@novatech.fr',
      password: await bcrypt.hash('Employer123!', saltRounds),
      firstname: 'Sophie',
      lastname: 'Leroy',
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE,
    });

    console.log(`Employeur créé : ${employerUser.email}`);
  } else {
    console.log(`Employeur déjà présent : ${employerUser.email}`);
  }

  let employerProfile = await employerRepository.findOne({
    where: { userId: employerUser.id },
  });

  if (!employerProfile) {
    employerProfile = await employerRepository.save({
      userId: employerUser.id,
      companyName: 'NovaTech Solutions',
      companyDesc:
        'Entreprise française spécialisée dans le développement de plateformes web et de services numériques pour les entreprises.',
      verifiedAt: new Date('2026-08-20T09:30:00.000Z'),
    });

    console.log(`Profil employeur créé : ${employerProfile.companyName}`);
  } else {
    console.log(
      `Profil employeur déjà présent : ${employerProfile.companyName}`,
    );
  }

  /*
   * SEEKER
   */
  let seekerUser = await userRepository.findOne({
    where: { email: 'lucas.bernard@example.fr' },
  });

  if (!seekerUser) {
    seekerUser = await userRepository.save({
      email: 'lucas.bernard@example.fr',
      password: await bcrypt.hash('Seeker123!', saltRounds),
      firstname: 'Lucas',
      lastname: 'Bernard',
      role: UserRole.SEEKER,
      status: UserStatus.ACTIVE,
    });

    console.log(`Candidat créé : ${seekerUser.email}`);
  } else {
    console.log(`Candidat déjà présent : ${seekerUser.email}`);
  }

  let seekerProfile = await seekerRepository.findOne({
    where: { userId: seekerUser.id },
  });

  if (!seekerProfile) {
    seekerProfile = await seekerRepository.save({
      userId: seekerUser.id,
      skills: [
        'TypeScript',
        'NestJS',
        'React',
        'PostgreSQL',
        'Docker',
        'Git',
      ],
      experience:
        '3 ans d’expérience en développement web full stack, principalement sur des applications TypeScript.',
      availability: 'Disponible sous 2 semaines',
    });

    console.log(`Profil candidat créé pour ${seekerUser.email}`);
  } else {
    console.log(`Profil candidat déjà présent pour ${seekerUser.email}`);
  }

  /*
   * JOB
   */
  const jobTitle = 'Développeur Full Stack TypeScript';

  let job = await jobRepository.findOne({
    where: {
      title: jobTitle,
      employerId: employerUser.id,
    },
  });

  if (!job) {
    job = await jobRepository.save({
      employerId: employerUser.id,
      title: jobTitle,
      description:
        'NovaTech Solutions recherche un développeur Full Stack pour participer au développement et à la maintenance de ses applications web. Vous travaillerez principalement avec NestJS, React, PostgreSQL et Docker au sein d’une équipe produit pluridisciplinaire.',
      adress: '55 Rue du Faubourg Saint-Honoré, 75008 Paris',
      lat: 48.87063,
      lng: 2.316931,
      geocodingSource: 'api-adresse',
      geocodingScore: 0.95,
      geocodedAt: new Date(),
      GeocodingStatus: GeoCodingStatus.VALID,
      archivedAt: null,
    });

    console.log(`Offre créée : ${job.title}`);
  } else {
    console.log(`Offre déjà présente : ${job.title}`);
  }

  console.log('\n--- Comptes de démonstration ---');
  console.log('Admin      : admin@geoemploi.fr / Admin123!');
  console.log('Employeur  : recrutement@novatech.fr / Employer123!');
  console.log('Candidat   : lucas.bernard@example.fr / Seeker123!');
  console.log('--------------------------------');

  await dataSource.destroy();

  console.log('Seed terminé.');
}

seed().catch(async (error) => {
  console.error('Erreur pendant le seed :', error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});

