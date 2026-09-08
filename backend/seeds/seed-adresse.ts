import { DataSource } from 'typeorm';

import {
  User,
} from '../src/users/entities/user.entity';

import {
  Employer,
} from '../src/employers/entities/employer.entity';

import {
  Seeker,
} from '../src/seekers/entities/seeker.entity';

import {
  Job,
  GeoCodingStatus,
} from '../src/jobs/entities/job.entity';

import {
  Application,
} from '../src/applications/entities/application.entity';

const dataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST || 'db',

  port: Number(
    process.env.DB_PORT || 5432,
  ),

  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [
    User,
    Employer,
    Seeker,
    Job,
    Application,
  ],

  synchronize: false,
});

async function seedLegacy() {
  console.log(
    'Création de l’offre legacy...',
  );

  await dataSource.initialize();

  const userRepository =
    dataSource.getRepository(User);

  const jobRepository =
    dataSource.getRepository(Job);

  const employer =
    await userRepository.findOne({
      where: {
        email:
          'recrutement@novatech.fr',
      },
    });

  if (!employer) {
    throw new Error(
      'Employeur NovaTech absent. Lance npm run seed avant.',
    );
  }

  const title =
    'LEGACY - Développeur TypeScript Paris';

  const existing =
    await jobRepository.findOne({
      where: {
        title,
        employerId: employer.id,
      },
    });

  if (existing) {
    console.log(
      'Offre legacy déjà présente.',
    );

    await dataSource.destroy();
    return;
  }

  const job =
    await jobRepository.save({
      employerId: employer.id,

      title,

      description:
        'Offre temporaire utilisée pour démontrer la migration d’une localisation précise vers une localisation communale.',

      /*
       * DONNÉE LEGACY VOLONTAIREMENT PRÉCISE
       * Cette valeur devra disparaître après migration.
       */
      commune:
        '55 Rue du Faubourg Saint-Honoré, 75008 Paris',

      lat: 48.87063,
      lng: 2.316931,

      locationPrecision: 'address',

      geocodingSource:
        'legacy-address',

      geocodingScore: 1,

      geocodedAt:
        new Date(),

      GeocodingStatus:
        GeoCodingStatus.VALID,

      archivedAt: null,

      views: 0,
    });

  console.log(
    `Offre legacy créée : #${job.id}`,
  );

  console.log(
    `Localisation AVANT : ${job.commune}`,
  );

  console.log(
    `Précision AVANT : ${job.locationPrecision}`,
  );

  await dataSource.destroy();

  console.log(
    'Seed legacy terminé.',
  );
}

seedLegacy().catch(async (error) => {
  console.error(
    'Erreur seed legacy :',
    error,
  );

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
