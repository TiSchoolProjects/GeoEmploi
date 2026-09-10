import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from '../src/users/entities/user.entity';
import { Employer } from '../src/employers/entities/employer.entity';
import { Seeker } from '../src/seekers/entities/seeker.entity';
import { Job } from '../src/jobs/entities/job.entity';
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
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  let admin = await userRepository.findOne({
    where: { email: 'admin@job-et-bonheur.fr' },
  });

  if (!admin) {
    admin = await userRepository.save({
      email: 'admin@job-et-bonheur.fr',
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
}

console.log(`Profil admin: admin@job-et-bonheur.fr : Admin123!`);
seed().catch(async (error) => {
  console.error('Erreur pendant le seed :', error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});

