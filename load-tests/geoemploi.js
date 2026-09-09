import http from 'k6/http';

import {
  check,
  sleep,
} from 'k6';

import {
  Trend,
  Rate,
  Gauge,
} from 'k6/metrics';

const BASE_URL =
  __ENV.BASE_URL ||
  'http://localhost:4242';

const DURATION =
  __ENV.DURATION ||
  '3m';

const LIST_VUS =
  Number(__ENV.LIST_VUS || 25);

const MAP_VUS =
  Number(__ENV.MAP_VUS || 25);

/*
 * Métriques personnalisées.
 */

const listDuration =
  new Trend(
    'jobs_list_duration',
    true,
  );

const mapJobsDuration =
  new Trend(
    'map_jobs_duration',
    true,
  );

const mapTileDuration =
  new Trend(
    'map_tile_duration',
    true,
  );

const listErrors =
  new Rate('jobs_list_errors');

const mapErrors =
  new Rate('map_errors');

const totalErrors =
  new Rate('scenario_errors');

const seededOffers =
  new Gauge('seeded_offers');

const seededCommunes =
  new Gauge('seeded_communes');

/*
 * Quelques tuiles couvrant différentes zones
 * de France.
 *
 * Elles sont préchargées dans setup() afin
 * de mesurer principalement notre backend
 * et son cache, et non la latence Internet
 * du service IGN.
 */

const tiles = [
  [6, 32, 22], // Paris
  [6, 32, 23], // Sud
  [6, 31, 22], // Bretagne
  [6, 33, 22], // Est
  [6, 31, 23], // Bordeaux
  [6, 32, 21], // Nord
  [6, 33, 23], // Sud-Est
];

export const options = {
  scenarios: {
    liste_offres: {
      executor: 'constant-vus',
      exec: 'listOffers',

      vus: LIST_VUS,

      duration: DURATION,

      gracefulStop: '5s',
    },

    consultation_carte: {
      executor: 'constant-vus',
      exec: 'viewMap',

      vus: MAP_VUS,

      duration: DURATION,

      gracefulStop: '5s',
    },
  },

  summaryTrendStats: [
    'avg',
    'min',
    'med',
    'p(90)',
    'p(95)',
    'max',
  ],
};

export function setup() {
  /*
   * Vérification obligatoire du dataset.
   */

  const jobsResponse = http.get(
    `${BASE_URL}/jobs`,
    {
      tags: {
        request_type: 'setup',
      },
    },
  );

  if (jobsResponse.status !== 200) {
    throw new Error(
      `GET /jobs impossible : HTTP ${jobsResponse.status}`,
    );
  }

  const jobs = jobsResponse.json();

  if (!Array.isArray(jobs)) {
    throw new Error(
      'GET /jobs ne retourne pas un tableau.',
    );
  }

  const communes =
    new Set(
      jobs
        .map((job) => job.commune)
        .filter(Boolean),
    );

  seededOffers.add(jobs.length);
  seededCommunes.add(communes.size);

  console.log(
    `Dataset : ${jobs.length} offres / ${communes.size} communes`,
  );

  if (
    jobs.length < 500 ||
    communes.size < 50
  ) {
    throw new Error(
      `Dataset insuffisant : ${jobs.length} offres / ${communes.size} communes. ` +
      'Minimum requis : 500 offres / 50 communes.',
    );
  }

  /*
   * Warm-up du cache cartographique.
   *
   * Sans ça, on mesurerait en partie
   * data.geopf.fr au lieu de GéoEmploi.
   */

  for (const [z, x, y] of tiles) {
    const response = http.get(
      `${BASE_URL}/cartography/tiles/${z}/${x}/${y}`,
      {
        tags: {
          request_type: 'warmup',
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(
        `Impossible de précharger la tuile ${z}/${x}/${y} : HTTP ${response.status}`,
      );
    }
  }

  console.log(
    'Cache cartographique préchargé.',
  );

  return {};
}

/*
 * 25 utilisateurs simulés par défaut.
 *
 * Ils consultent la liste des offres
 * toutes les ~2 secondes.
 */

export function listOffers() {
  const response = http.get(
    `${BASE_URL}/jobs`,
    {
      tags: {
        endpoint: 'jobs_list',
      },
    },
  );

  listDuration.add(
    response.timings.duration,
  );

  const success = check(
    response,
    {
      'liste: HTTP 200': (r) =>
        r.status === 200,

      'liste: réponse non vide': (r) =>
        r.body &&
        r.body.length > 2,
    },
  );

  listErrors.add(!success);
  totalErrors.add(!success);

  sleep(2);
}

/*
 * 25 utilisateurs simulés par défaut.
 *
 * Une consultation de carte charge :
 * - les offres pour les marqueurs ;
 * - 4 tuiles cartographiques.
 */

export function viewMap() {
  const jobsResponse = http.get(
    `${BASE_URL}/jobs`,
    {
      tags: {
        endpoint: 'map_jobs',
      },
    },
  );

  mapJobsDuration.add(
    jobsResponse.timings.duration,
  );

  const jobsSuccess = check(
    jobsResponse,
    {
      'carte offres: HTTP 200': (r) =>
        r.status === 200,
    },
  );

  mapErrors.add(!jobsSuccess);
  totalErrors.add(!jobsSuccess);

  /*
   * On simule plusieurs tuiles visibles
   * simultanément dans MapLibre.
   */

  const start =
    Math.floor(
      Math.random() * tiles.length,
    );

  const requests = [];

  for (let i = 0; i < 4; i++) {
    const tile =
      tiles[
        (start + i) %
          tiles.length
      ];

    const [z, x, y] = tile;

    requests.push({
      method: 'GET',

      url:
        `${BASE_URL}/cartography/tiles/${z}/${x}/${y}`,

      params: {
        tags: {
          endpoint: 'map_tile',
        },
      },
    });
  }

  const responses =
    http.batch(requests);

  for (const response of responses) {
    mapTileDuration.add(
      response.timings.duration,
    );

    const tileSuccess = check(
      response,
      {
        'tuile: HTTP 200': (r) =>
          r.status === 200,
      },
    );

    mapErrors.add(!tileSuccess);
    totalErrors.add(!tileSuccess);
  }

  sleep(2);
}

function trendValues(data, name) {
  return (
    data.metrics[name]?.values || {}
  );
}

function rateValue(data, name) {
  return (
    data.metrics[name]
      ?.values
      ?.rate || 0
  );
}

function formatMs(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return 'N/A';
  }

  return `${value.toFixed(2)} ms`;
}

function formatRate(value) {
  return `${(value * 100).toFixed(2)} %`;
}

/*
 * Génération automatique du rapport demandé.
 */

export function handleSummary(data) {
  const list =
    trendValues(
      data,
      'jobs_list_duration',
    );

  const mapJobs =
    trendValues(
      data,
      'map_jobs_duration',
    );

  const tilesMetric =
    trendValues(
      data,
      'map_tile_duration',
    );

  const listErrorRate =
    rateValue(
      data,
      'jobs_list_errors',
    );

  const mapErrorRate =
    rateValue(
      data,
      'map_errors',
    );

  const globalErrorRate =
    rateValue(
      data,
      'scenario_errors',
    );

  const offers =
    data.metrics.seeded_offers
      ?.values
      ?.value ?? 'N/A';

  const communes =
    data.metrics.seeded_communes
      ?.values
      ?.value ?? 'N/A';

  const report = `# Rapport de charge GéoEmploi

## Scénario

Outil : k6

Durée : ${DURATION}

Utilisateurs simultanés : ${LIST_VUS + MAP_VUS}

Répartition :

- liste des offres : ${LIST_VUS} utilisateurs ;
- consultation de la carte : ${MAP_VUS} utilisateurs.

Base testée :

- ${offers} offres ;
- ${communes} communes.

La carte charge la liste des offres ainsi que des tuiles servies par le proxy cartographique GéoEmploi.

Les tuiles sont préchargées avant la phase mesurée afin de mesurer principalement les performances de l'application locale et de son cache, plutôt que la latence du service IGN externe.

## Résultats

| Flux | Médiane | p95 | Taux d'erreur |
| --- | ---: | ---: | ---: |
| Liste des offres | ${formatMs(list.med)} | ${formatMs(list['p(95)'])} | ${formatRate(listErrorRate)} |
| Données de la carte | ${formatMs(mapJobs.med)} | ${formatMs(mapJobs['p(95)'])} | ${formatRate(mapErrorRate)} |
| Tuiles cartographiques | ${formatMs(tilesMetric.med)} | ${formatMs(tilesMetric['p(95)'])} | ${formatRate(mapErrorRate)} |

Taux d'erreur global : **${formatRate(globalErrorRate)}**

## Première correction envisagée

La première ligne à examiner si les temps de réponse de la liste ou des données de carte sont élevés est la requête de \`JobsService.findAll()\` :

\`\`\`ts
return this.jobRepository.find({
  where: {
    archivedAt: IsNull(),
  },
});
\`\`\`

Cette route renvoie actuellement l'intégralité des offres actives à chaque consultation. Avec plusieurs centaines d'offres, chaque requête implique la lecture, la sérialisation et le transfert de tous les objets, y compris leurs descriptions.

La première optimisation envisagée serait donc de limiter les colonnes retournées pour la carte et/ou d'introduire de la pagination pour la liste des offres. Un cache applicatif peut ensuite être envisagé si nécessaire.

## Analyse

À compléter après le test en fonction des chiffres observés.

Si le p95 est élevé ou si le taux d'erreur augmente, le résultat doit être conservé tel quel et expliqué plutôt que masqué.
`;

  const consoleSummary = `
GéoEmploi - charge k6
=====================

Dataset : ${offers} offres / ${communes} communes
Charge  : ${LIST_VUS + MAP_VUS} utilisateurs pendant ${DURATION}

Liste offres
  médiane : ${formatMs(list.med)}
  p95     : ${formatMs(list['p(95)'])}
  erreurs : ${formatRate(listErrorRate)}

Carte - données
  médiane : ${formatMs(mapJobs.med)}
  p95     : ${formatMs(mapJobs['p(95)'])}

Carte - tuiles
  médiane : ${formatMs(tilesMetric.med)}
  p95     : ${formatMs(tilesMetric['p(95)'])}

Erreurs globales : ${formatRate(globalErrorRate)}

Rapport : load-tests/results/report.md
`;

  return {
    stdout: consoleSummary,

    'load-tests/results/report.md':
      report,

    'load-tests/results/summary.json':
      JSON.stringify(
        data,
        null,
        2,
      ),
  };
}
