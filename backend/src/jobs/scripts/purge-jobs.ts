import 'dotenv/config';
import 'reflect-metadata';

import {
  DataSource,
  LessThan,
  Not,
  IsNull,
} from 'typeorm';

import { Job } from '../entities/job.entity';
import { User } from '../../users/entities/user.entity';
import { Employer } from '../../employers/entities/employer.entity';
import { Seeker } from '../../seekers/entities/seeker.entity';
import { Application } from '../../applications/entities/application.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'db',
  port: Number(
    process.env.DB_PORT || 5432,
  ),
  username:
    process.env.DB_USER || 'GeoUser',
  password:
    process.env.DB_PASSWORD || 'GeoPassword',
  database:
    process.env.DB_NAME || 'GeoDB',

  entities: [
    Job,
    User,
    Employer,
    Seeker,
    Application,
  ],

  synchronize: false,
});

async function main() {
  console.log(
    '- Purge des offres de plus de 90 jours -',
  );

  await dataSource.initialize();

  const repo =
    dataSource.getRepository(Job);

  const cutoffDate = new Date();

  cutoffDate.setDate(
    cutoffDate.getDate() - 90,
  );

  console.log(
    `Date limite : ${cutoffDate.toISOString()}`,
  );

  const jobs = await repo.find({
    where: {
      createdAt: LessThan(cutoffDate),
      archivedAt: Not(IsNull()),
    },
  });

  console.log(
    `${jobs.length} offre(s) à supprimer.`,
  );

  for (const job of jobs) {
    console.log(
      `Suppression #${job.id} - ${job.title}`,
    );
  }

  if (jobs.length > 0) {
    await repo.remove(jobs);
  }

  console.log(
    `${jobs.length} offre(s) supprimée(s).`,
  );

  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error(
    'Erreur purge :',
    error,
  );

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
