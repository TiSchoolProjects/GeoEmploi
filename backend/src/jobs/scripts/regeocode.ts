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
  host: 'db',
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
          geocodingSource: "api-adresse",
          geocodedAt: null,
          GeocodingStatus: GeoCodingStatus.TO_VERIFY,
        };
      }

      const first = feats[0];

      if (first.properties.score < 0.7) {
        return {
          lat: null,
          lng: null,
          geocodingScore: null,
          geocodingSource: "api-adresse",
          geocodedAt: null,
          GeocodingStatus: GeoCodingStatus.TO_VERIFY,
        };
      }

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
        geocodingSource: "api-adresse",
        geocodedAt: null,
        GeocodingStatus: GeoCodingStatus.TO_VERIFY,
      }
    }
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000;
}


async function main() {
  const startT = Date.now();
  console.log('-Script de Re-géocodage GeoEmploi-');

  await dataSource.initialize();

  const repo = dataSource.getRepository(Job);

  const toHandle = await repo.createQueryBuilder("job").where(
    `job."GeocodingStatus" != :valid 
    OR job."geocodingSource" IS DISTINCT FROM :source
    OR job.lat IS NULL
    OR job.lng IS NULL
    `,
    {
      valid: GeoCodingStatus.VALID,
      source: "api-adresse",
    },
  ).getMany();

  console.log(`${toHandle.length} offre(s) à Re-géocoder.\n`);

  let suc = 0;
  let fail = 0;
  let totalDis = 0;
  let moved = 0;
  const movements: { id: number; address: string; distance: number;}[] = [];

  for (const job of toHandle) {
    console.log(`Adresse n°${job.id} - ${job.adress}`);
    
    const OldLat = job.lat != null ? Number(job.lat) : null;
    const OldLng = job.lng != null ? Number(job.lng) : null;
    const result = await geocode(job.adress);

    await repo.update(job.id, result);

    if (result.GeocodingStatus === GeoCodingStatus.VALID && result.lat != null && result.lng != null) {
      suc++;
      console.log(`Réussite : ${result.lat}, ${result.lng}`,);

      const newLat = Number(result.lat);
      const newLng = Number(result.lng);
      
      if (OldLat != null && OldLng != null) {
        const dis = calculateDistance(OldLat, OldLng, newLat, newLng);

      moved++;
      totalDis += dis;
      movements.push({id: job.id, address: job.adress, distance: dis});
      console.log(` Déplacement: ${dis.toFixed(0)}mètre(s).`);
      }
    } else {
      fail++;
      console.log(`Localisation à vérifier`);
    }
    await sleep(1000);
  }

  const time = (Date.now() - startT) / 1000;
  movements.sort((a,b) => b.distance - a.distance);
  const avgDis = moved > 0 ? totalDis / moved : 0;

  console.log('\n\n - Résultat - ');
  console.log(`Offres traitées : ${toHandle.length}`);
  console.log(`Succès : ${suc}`);
  console.log(`Echecs : ${fail}`);
  console.log(`Temps d'éxécution: ${time.toFixed(1)} secondes`);
  console.log(`Déplacement moyen: ${avgDis.toFixed(1)} mètre(s)`);

  if (movements.length > 0) {
    console.log('\n\n- Top 5 des Déplacements -');
    for(const move of movements.slice(0,5)) {
      console.log(`Adresse n°${move.id} - ${move.address} - ${move.distance.toFixed(0)} m`)
    }
  }

  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error('Erreur :', error);

  if(dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
