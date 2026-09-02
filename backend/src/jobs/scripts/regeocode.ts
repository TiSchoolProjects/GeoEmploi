import { resolve } from "path";
import { DataSource, IsNull } from "typeorm";
import { GeoCodingStatus, Job } from "../entities/job.entity";
import { async } from "rxjs";
import 'dotenv/config';
import 'reflect-metadata';
import { User } from "../../users/entities/user.entity";
import { Employer } from "../../employers/entities/employer.entity";
import { Seeker } from "../../seekers/entities/seeker.entity";
import { Application } from "../../applications/entities/application.entity";

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'GeoUser',
  password: process.env.DB_PASSWORD || 'GeoPassword',
  database: process.env.DB_NAME || 'GeoDB',
  entities: [Job, User, Employer, Seeker, Application],
  synchronize: false,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(address: string): Promise<Partial<Job>> {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
    try {
      const reponse = await fetch(url);

      if (!reponse.ok) {
        throw new Error(
          `Erreur Api: ${reponse.status} ${reponse.statusText}`);
      }

      const data = await reponse.json();
      const feats = data.features;
      
      if (!feats || feats.length === 0) {
        return {
          lat: null,
          lng: null,
          geocodingScore: null,
          geocodingSource: null,
          geocodedAt: null,
          GeocodingStatus: GeoCodingStatus.TO_VERIFY,
        };
      }

      const first = feats[0];
      const[lng, lat] = first.geometry.coordinates;
      const score = first.properties.score;

      return {
        lat,
        lng,
        geocodingSource: 'api-adresse',
        geocodingScore: score,
        geocodedAt: new Date(),
        GeocodingStatus: GeoCodingStatus.VALID,
      }
    } catch (error) {
      console.log(`Erreur API pour "${address}"`);
      return{
        lat: null,
        lng: null,
        geocodingScore: null,
        geocodingSource: null,
        geocodedAt: null,
        GeocodingStatus: GeoCodingStatus.TO_VERIFY,
      }
    }
}

async function main() {
  console.log('-Script de Re-géocodage GeoEmploi-');

  await dataSource.initialize();
  const repo = dataSource.getRepository(Job);

  const toHandle = await repo.find({ where: [
    {GeocodingStatus: GeoCodingStatus.TO_VERIFY,},
    {lat: IsNull(),},
    {lng: IsNull(),},
  ],})

  console.log(`${toHandle.length} offre(s) à Re-géocoder.\n`);

  let suc = 0;
  let fail = 0;

  for (const job of toHandle) {
    console.log(`Adresse n°${job.id} - ${job.adress}`);
    const result = await geocode(job.adress);

    await repo.update(job.id, result);

    if (result.GeocodingStatus === GeoCodingStatus.VALID) {
      suc++;
      console.log(`Réussite : ${result.lat}, ${result.lng}`,);
    } else {
      fail++;
      console.log(`à revérifier`);
    }
    await sleep(1000);
  }

  console.log('\n - Résultat - ');
  console.log(`Offres traitées : ${toHandle.length}`);
  console.log(`Succès : ${suc}`);
  console.log(`Echecs : ${fail}`);

  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error('Erreur :', error);

  if(dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
