import 'dotenv/config';
import { DataSource } from 'typeorm';
import {
  Challenge,
  ChallengeType,
} from '../src/challenges/entities/challenge.entity';

function getParisDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === 'year',
  )?.value;

  const month = parts.find(
    (part) => part.type === 'month',
  )?.value;

  const day = parts.find(
    (part) => part.type === 'day',
  )?.value;

  return `${year}-${month}-${day}`;
}

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    entities: [Challenge],

    synchronize: false,
  });

  try {
    await dataSource.initialize();

    const repository =
      dataSource.getRepository(Challenge);

    const today = getParisDate();

    console.log(`Date Paris : ${today}`);

    const existing =
      await repository.findOne({
        where: {
          scheduledDate: today,
        },
      });

    if (existing) {
      existing.title =
        'Consultez 3 offres différentes';

      existing.description =
        "Consultez trois offres différentes aujourd'hui.";

      existing.type =
        ChallengeType.VIEW_JOBS;

      existing.target = 3;
      existing.active = true;

      await repository.save(existing);

      console.log(
        `Défi existant mis à jour : ${existing.id}`,
      );
    } else {
      const challenge =
        repository.create({
          title:
            'Consultez 3 offres différentes',

          description:
            "Consultez trois offres différentes aujourd'hui.",

          type:
            ChallengeType.VIEW_JOBS,

          target: 3,

          scheduledDate: today,

          active: true,
        });

      const saved =
        await repository.save(challenge);

      console.log(
        `Défi créé : ${saved.id}`,
      );
    }

    console.log('');
    console.log('Test :');
    console.log('  Home    -> 0 / 3');
    console.log('  Offre A -> 1 / 3');
    console.log('  Offre B -> 2 / 3');
    console.log('  Offre C -> 3 / 3');
  } catch (error) {
    console.error(
      'Seed challenge échoué :',
      error,
    );

    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seed();
