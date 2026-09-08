import { DataSource, IsNull } from "typeorm";
import { GeoCodingStatus, Job } from "../entities/job.entity";
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
  const addressUrl =
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;

  const addressResponse =
    await fetch(addressUrl);

  const addressData =
    await addressResponse.json();

  if (
    !addressData.features ||
    addressData.features.length === 0
  ) {
    return {
      commune: 'Commune à vérifier',
      lat: null,
      lng: null,
      locationPrecision: 'commune',
      geocodingSource: 'api-adresse',
      geocodingScore: null,
      geocodedAt: null,
      GeocodingStatus:
        GeoCodingStatus.TO_VERIFY,
    };
  }

  const addressFeature =
    addressData.features[0];

  const city =
    addressFeature.properties.city ||
    addressFeature.properties.name;

  if (!city) {
    return {
      commune: 'Commune à vérifier',
      lat: null,
      lng: null,
      locationPrecision: 'commune',
      geocodingSource: 'api-adresse',
      geocodingScore: null,
      geocodedAt: null,
      GeocodingStatus:
        GeoCodingStatus.TO_VERIFY,
    };
  }

  const communeUrl =
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(city)}&type=municipality&limit=1`;

  const communeResponse =
    await fetch(communeUrl);

  const communeData =
    await communeResponse.json();

  if (
    !communeData.features ||
    communeData.features.length === 0
  ) {
    return {
      commune: city,
      lat: null,
      lng: null,
      locationPrecision: 'commune',
      geocodingSource: 'api-adresse',
      geocodingScore: null,
      geocodedAt: null,
      GeocodingStatus:
        GeoCodingStatus.TO_VERIFY,
    };
  }

  const feature =
    communeData.features[0];

  const [lng, lat] =
    feature.geometry.coordinates;

  return {
    commune:
      feature.properties.city ||
      feature.properties.name ||
      city,

    lat,
    lng,

    locationPrecision: 'commune',

    geocodingSource: 'api-adresse',

    geocodingScore:
      feature.properties.score ?? null,

    geocodedAt: new Date(),

    GeocodingStatus:
      GeoCodingStatus.VALID,
  };
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

  const toHandle = await repo.find();

  console.log(`${toHandle.length} offre(s) à Re-géocoder.\n`);

  let suc = 0;
  let fail = 0;
  let totalDis = 0;
  let moved = 0;
  const movements: { id: number; address: string; distance: number;}[] = [];

  for (const job of toHandle) {
    console.log(`Adresse n°${job.id} - ${job.commune}`);
    
    const OldLat = job.lat != null ? Number(job.lat) : null;
    const OldLng = job.lng != null ? Number(job.lng) : null;
    const result = await geocode(job.commune);

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
      movements.push({id: job.id, address: job.commune, distance: dis});
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
