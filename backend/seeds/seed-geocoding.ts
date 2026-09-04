import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from '../src/users/entities/user.entity';
import { Employer } from '../src/employers/entities/employer.entity';
import { Seeker } from '../src/seekers/entities/seeker.entity';
import { Job, GeoCodingStatus } from '../src/jobs/entities/job.entity';
import { Application } from '../src/applications/entities/application.entity';
import { UserRole } from '../src/auth/roles.enum';


const LEGACY_SOURCE = 'nominatim-osm-legacy';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'GeoUser',
  password: process.env.DB_PASSWORD || 'GeoPassword',
  database: process.env.DB_NAME || 'GeoDB',
  entities: [User, Employer, Seeker, Job, Application],
  synchronize: false,
});

type LegacyJobSeed = {
  title: string;
  description: string;
  adress: string;
  employerEmail: string;
};

const legacyJobs: LegacyJobSeed[] = [
  {
    title: 'Développeur Fullstack TypeScript',
    description: 'Développement d’une plateforme web NestJS / React pour un service public numérique.',
    adress: '55 Rue du Faubourg Saint-Honoré, 75008 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Ingénieur Backend Node.js',
    description: 'Conception d’API, traitements asynchrones et intégrations PostgreSQL.',
    adress: '1 Place de la Comédie, 69001 Lyon',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Administrateur systèmes Linux',
    description: 'Administration d’infrastructures Linux, conteneurs et supervision.',
    adress: '58 Boulevard Charles Livon, 13007 Marseille',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Data Analyst',
    description: 'Analyse de données métiers, SQL et construction de tableaux de bord.',
    adress: '1 Place Pey Berland, 33000 Bordeaux',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Technicien support informatique',
    description: 'Support utilisateurs, qualification des incidents et gestion de parc.',
    adress: 'Place Augustin Laurent, 59000 Lille',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Développeur Frontend React',
    description: 'Développement d’interfaces accessibles, responsives et compatibles DSFR.',
    adress: "2 Rue de l'Hôtel de Ville, 44000 Nantes",
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Ingénieur DevOps',
    description: 'CI/CD, Docker, observabilité et automatisation des déploiements.',
    adress: '1 Place du Capitole, 31000 Toulouse',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Chef de projet numérique',
    description: 'Pilotage de projets numériques, coordination produit et suivi des prestataires.',
    adress: 'Place de la Mairie, 35000 Rennes',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Développeur Java',
    description: 'Maintenance et évolution d’applications Java orientées services.',
    adress: "1 Parc de l'Étoile, 67000 Strasbourg",
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Product Designer',
    description: 'Recherche utilisateur, prototypage et conception d’interfaces accessibles.',
    adress: '1 Place Georges Frêche, 34000 Montpellier',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Chargé de cybersécurité',
    description: 'Analyse des risques, durcissement et accompagnement sécurité des équipes.',
    adress: '2 Place du Général de Gaulle, 76000 Rouen',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Agent logistique - localisation à vérifier',
    description: 'Offre volontairement seedée avec une adresse non exploitable pour tester le cas d’échec.',
    adress: 'Site logistique interne ZK-42, quai bleu, France',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Ingénieur logiciel Python',
    description: 'Développement de services Python, automatisation et traitement de données.',
    adress: '1 Place de l’Hôtel de Ville, 21000 Dijon',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Développeur mobile Flutter',
    description: 'Conception et maintenance d’applications mobiles multiplateformes.',
    adress: 'Place de l’Hôtel de Ville, 80000 Amiens',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Administrateur bases de données',
    description: 'Exploitation PostgreSQL, sauvegardes, supervision et optimisation.',
    adress: 'Place Stanislas, 54000 Nancy',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'UX Researcher',
    description: 'Entretiens utilisateurs, tests d’utilisabilité et synthèse des apprentissages.',
    adress: 'Place du Ralliement, 49000 Angers',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Responsable infrastructure cloud',
    description: 'Pilotage d’infrastructures cloud, sécurité et maîtrise des coûts.',
    adress: 'Place de Jaude, 63000 Clermont-Ferrand',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Développeur .NET',
    description: 'Développement d’applications métier C# et APIs REST.',
    adress: 'Place de la Libération, 25000 Besançon',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Scrum Master',
    description: 'Animation des rituels agiles et accompagnement des équipes produit.',
    adress: 'Place de la République, 87000 Limoges',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Ingénieur réseau',
    description: 'Administration réseau, sécurité périmétrique et supervision.',
    adress: 'Place du Maréchal Foch, 14000 Caen',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Développeur QA automatisation',
    description: 'Automatisation des tests end-to-end et intégration dans la CI.',
    adress: 'Place de l’Hôtel de Ville, 51100 Reims',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Business Analyst SI',
    description: 'Recueil des besoins, modélisation des processus et suivi de réalisation.',
    adress: 'Place de l’Hôtel de Ville, 38000 Grenoble',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Technicien exploitation',
    description: 'Supervision, traitement des alertes et maintien en condition opérationnelle.',
    adress: 'Place de la République, 45000 Orléans',
    employerEmail: 'employer.lyon@demo.fr',
  },
  {
    title: 'Support applicatif - adresse ambiguë',
    description: 'Cas volontairement ambigu pour vérifier le traitement des résultats de faible confiance.',
    adress: '12 Rue de la Gare, France',
    employerEmail: 'employer.sud@demo.fr',
  },
  {
    title: 'Développeur Full Stack Paris',
    description: 'Développement et maintenance d’applications web.',
    adress: '55 Rue du Faubourg Saint-Honoré, 75008 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Ingénieur logiciel Paris',
    description: 'Conception et développement de services applicatifs.',
    adress: '5 Avenue Anatole France, 75007 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Product Owner Paris',
    description: 'Pilotage produit et coordination des équipes techniques.',
    adress: "Place de l'Hôtel de Ville, 75004 Paris",
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Data Engineer Paris',
    description: 'Développement de pipelines et traitement de données.',
    adress: 'Place du Panthéon, 75005 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'UX Designer Paris',
    description: 'Conception d’interfaces et amélioration de l’expérience utilisateur.',
    adress: '1 Place du Louvre, 75001 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Ingénieur DevOps Paris',
    description: 'Automatisation CI/CD et gestion des infrastructures.',
    adress: '10 Place de la République, 75011 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Développeur Backend Paris',
    description: 'Développement d’API et de services backend.',
    adress: '1 Place de la Bastille, 75004 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
  {
    title: 'Chef de projet IT Paris',
    description: 'Coordination et suivi de projets numériques.',
    adress: '6 Place Saint-Germain-des-Prés, 75006 Paris',
    employerEmail: 'employer.paris@demo.fr',
  },
];

type NominatimResult = {
  lat: string;
  lon: string;
  importance?: number;
  display_name?: string;
  type?: string;
  class?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeWithNominatim(address: string): Promise<{
  lat: number | null;
  lng: number | null;
  score: number | null;
  displayName: string | null;
}> {
  const params = new URLSearchParams({
    q: address,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'fr',
    addressdetails: '1',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      'User-Agent': process.env.NOMINATIM_USER_AGENT || 'GeoEmploi-Demo-Seed/1.0 (educational project)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim HTTP ${response.status} pour \"${address}\"`);
  }

  const results = (await response.json()) as NominatimResult[];
  const result = results[0];

  if (!result) {
    return { lat: null, lng: null, score: null, displayName: null };
  }

  const lat = Number(result.lat);
  const lng = Number(result.lon);

  return {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    // Nominatim ne fournit pas de \"confidence score\" standardisé.
    // `importance` est conservé ici uniquement comme score legacy de démonstration.
    score: typeof result.importance === 'number' ? result.importance : null,
    displayName: result.display_name ?? null,
  };
}

async function ensureUser(params: {
  email: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  password: string;
}) {
  const repo = dataSource.getRepository(User);
  const existing = await repo.findOne({ where: { email: params.email } });
  if (existing) return existing;

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  return repo.save({
    email: params.email,
    password: await bcrypt.hash(params.password, saltRounds),
    firstname: params.firstname,
    lastname: params.lastname,
    role: params.role,
    status: UserStatus.ACTIVE,
  });
}

async function ensureEmployer(
  email: string,
  firstname: string,
  lastname: string,
  companyName: string,
) {
  const employerUser = await ensureUser({
    email,
    firstname,
    lastname,
    role: UserRole.EMPLOYER,
    password: 'employer',
  });

  const repo = dataSource.getRepository(Employer);
  const existing = await repo.findOne({ where: { userId: employerUser.id } });
  if (!existing) {
    await repo.save({
      userId: employerUser.id,
      companyName,
      companyDesc: `Employeur de démonstration GeoEmploi - ${companyName}.`,
      verifiedAt: new Date('2026-08-25T09:00:00Z'),
    });
  }

  return employerUser;
}

async function seed() {
  await dataSource.initialize();

  const employers = await Promise.all([
    ensureEmployer('employer.paris@demo.fr', 'Claire', 'Martin', 'Hexa Numérique'),
    ensureEmployer('employer.lyon@demo.fr', 'Nicolas', 'Bernard', 'Alpes Services'),
    ensureEmployer('employer.sud@demo.fr', 'Sofia', 'Roux', 'SudTech Emploi'),
  ]);

  const employerByEmail = new Map(employers.map((user) => [user.email, user]));

  const seekerUser = await ensureUser({
    email: 'seeker@demo.fr',
    firstname: 'Jean',
    lastname: 'Baptiste',
    role: UserRole.SEEKER,
    password: 'seeker',
  });

  const seekerRepo = dataSource.getRepository(Seeker);
  const existingSeeker = await seekerRepo.findOne({ where: { userId: seekerUser.id } });
  if (!existingSeeker) {
    await seekerRepo.save({
      userId: seekerUser.id,
      skills: ['TypeScript', 'NestJS', 'React', 'PostgreSQL'],
      experience: '2 years',
      availability: 'Immediately',
    });
  }

  const jobRepo = dataSource.getRepository(Job);
  let inserted = 0;
  let skipped = 0;

  // Date volontairement antérieure à la migration IGN / API Adresse.
  const legacyGeocodedAt = new Date('2026-08-28T10:30:00Z');

  for (const item of legacyJobs) {
    const employer = employerByEmail.get(item.employerEmail);
    if (!employer) {
      throw new Error(`Employeur de seed introuvable: ${item.employerEmail}`);
    }

    const existing = await jobRepo.findOne({
      where: {
        title: item.title,
        employerId: employer.id,
      },
    });

    // Idempotence : ne pas remettre en "legacy" une offre déjà migrée.
    if (existing) {
      skipped++;
      continue;
    }

    console.log(`Géocodage legacy ${inserted + skipped + 1}/${legacyJobs.length} : ${item.adress}`);

    let legacy;
    try {
      legacy = await geocodeWithNominatim(item.adress);
    } catch (error) {
      console.error(`  Erreur Nominatim : ${error instanceof Error ? error.message : error}`);
      legacy = { lat: null, lng: null, score: null, displayName: null };
    }

    console.log(
      legacy.lat !== null && legacy.lng !== null
        ? `  -> ${legacy.lat}, ${legacy.lng} (${legacy.displayName ?? 'résultat Nominatim'})`
        : '  -> aucun résultat Nominatim',
    );

    await jobRepo.save({
      employerId: employer.id,
      title: item.title,
      description: item.description,
      adress: item.adress,
      lat: legacy.lat,
      lng: legacy.lng,
      geocodingSource: LEGACY_SOURCE,
      geocodingScore: legacy.score,
      geocodedAt: legacyGeocodedAt,
      GeocodingStatus:
        legacy.lat !== null && legacy.lng !== null
          ? GeoCodingStatus.VALID
          : GeoCodingStatus.TO_VERIFY,
      archivedAt: null,
    });
    inserted++;

    await sleep(1100);
  }

  console.log('--- Seed GeoEmploi : base historique ---');
  console.log(`Source réelle utilisée : ${LEGACY_SOURCE}`);
  console.log(`Offres legacy insérées : ${inserted}`);
  console.log(`Offres déjà présentes ignorées : ${skipped}`);
  console.log(`Total du jeu de données : ${legacyJobs.length}`);
  console.log('Compte candidat : seeker@demo.fr / seeker');
  console.log('Comptes employeurs : *.demo.fr / employer');
  console.log('\nTu peux maintenant lancer : npm run regeocode');

  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Erreur pendant le seed :', error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});

