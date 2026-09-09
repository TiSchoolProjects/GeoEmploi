import { DataSource } from 'typeorm';

import { User } from '../src/users/entities/user.entity';
import { Employer } from '../src/employers/entities/employer.entity';
import { Seeker } from '../src/seekers/entities/seeker.entity';
import {
  Job,
  GeoCodingStatus,
} from '../src/jobs/entities/job.entity';
import { Application } from '../src/applications/entities/application.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
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

const communes = [
  ['Paris', 48.8566, 2.3522],
  ['Marseille', 43.2965, 5.3698],
  ['Lyon', 45.7640, 4.8357],
  ['Toulouse', 43.6047, 1.4442],
  ['Nice', 43.7102, 7.2620],
  ['Nantes', 47.2184, -1.5536],
  ['Montpellier', 43.6108, 3.8767],
  ['Strasbourg', 48.5734, 7.7521],
  ['Bordeaux', 44.8378, -0.5792],
  ['Lille', 50.6292, 3.0573],
  ['Rennes', 48.1173, -1.6778],
  ['Reims', 49.2583, 4.0317],
  ['Saint-Étienne', 45.4397, 4.3872],
  ['Le Havre', 49.4944, 0.1079],
  ['Toulon', 43.1242, 5.9280],
  ['Grenoble', 45.1885, 5.7245],
  ['Dijon', 47.3220, 5.0415],
  ['Angers', 47.4784, -0.5632],
  ['Nîmes', 43.8367, 4.3601],
  ['Villeurbanne', 45.7719, 4.8902],
  ['Clermont-Ferrand', 45.7772, 3.0870],
  ['Le Mans', 48.0061, 0.1996],
  ['Aix-en-Provence', 43.5297, 5.4474],
  ['Brest', 48.3904, -4.4861],
  ['Tours', 47.3941, 0.6848],
  ['Amiens', 49.8941, 2.2958],
  ['Limoges', 45.8336, 1.2611],
  ['Annecy', 45.8992, 6.1294],
  ['Perpignan', 42.6887, 2.8948],
  ['Boulogne-Billancourt', 48.8397, 2.2399],
  ['Metz', 49.1193, 6.1757],
  ['Besançon', 47.2378, 6.0241],
  ['Orléans', 47.9030, 1.9093],
  ['Rouen', 49.4432, 1.0993],
  ['Mulhouse', 47.7508, 7.3359],
  ['Caen', 49.1829, -0.3707],
  ['Nancy', 48.6921, 6.1844],
  ['Argenteuil', 48.9472, 2.2467],
  ['Montreuil', 48.8638, 2.4485],
  ['Roubaix', 50.6927, 3.1778],
  ['Tourcoing', 50.7249, 3.1612],
  ['Nanterre', 48.8924, 2.2060],
  ['Avignon', 43.9493, 4.8055],
  ['Créteil', 48.7904, 2.4556],
  ['Poitiers', 46.5802, 0.3404],
  ['Versailles', 48.8014, 2.1301],
  ['Pau', 43.2951, -0.3708],
  ['La Rochelle', 46.1603, -1.1511],
  ['Chambéry', 45.5646, 5.9178],
  ['Bayonne', 43.4929, -1.4748],
] as const;

async function seedLoad() {
  await dataSource.initialize();

  const userRepository =
    dataSource.getRepository(User);

  const jobRepository =
    dataSource.getRepository(Job);

  const employer = await userRepository.findOne({
    where: {
      email: 'recrutement@novatech.fr',
    },
  });

  if (!employer) {
    throw new Error(
      'Employeur de démonstration absent. Lancez npm run seed avant seed:load.',
    );
  }

  // Permet de relancer le seed sans accumuler les offres.
  await jobRepository
    .createQueryBuilder()
    .delete()
    .from(Job)
    .where('title LIKE :prefix', {
      prefix: '[LOAD]%',
    })
    .execute();

  const jobs: Partial<Job>[] = [];

  for (let communeIndex = 0; communeIndex < communes.length; communeIndex++) {
    const [commune, lat, lng] =
      communes[communeIndex];

    // 10 offres x 50 communes = 500 offres.
    for (let i = 1; i <= 10; i++) {
      jobs.push({
        employerId: employer.id,

        title:
          `[LOAD] Offre ${i} - ${commune}`,

        description:
          `Offre de charge k6 ${i} située à ${commune}. ` +
          'Donnée de démonstration utilisée uniquement pour les tests de performance.',

        commune,

        lat,
        lng,

        locationPrecision: 'commune',

        geocodingSource: 'load-test',

        geocodingScore: 1,

        geocodedAt: new Date(),

        GeocodingStatus:
          GeoCodingStatus.VALID,

        archivedAt: null,

        views: 0,
      });
    }
  }

  await jobRepository.insert(jobs);

  const count = await jobRepository
    .createQueryBuilder('job')
    .where('job.title LIKE :prefix', {
      prefix: '[LOAD]%',
    })
    .getCount();

  const rows = await jobRepository
    .createQueryBuilder('job')
    .select('COUNT(DISTINCT job.commune)', 'count')
    .where('job.title LIKE :prefix', {
      prefix: '[LOAD]%',
    })
    .getRawOne();

  const communeCount =
    Number(rows?.count ?? 0);

  console.log(
    `Seed charge terminé : ${count} offres / ${communeCount} communes.`,
  );

  if (count < 500 || communeCount < 50) {
    throw new Error(
      'Le jeu de charge ne respecte pas 500 offres / 50 communes.',
    );
  }

  await dataSource.destroy();
}

seedLoad().catch(async (error) => {
  console.error(error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
