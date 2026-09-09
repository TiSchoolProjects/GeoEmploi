# GéoEmploi

GéoEmploi est une application de consultation et de gestion d'offres d'emploi avec cartographie.

L'application permet notamment :

- la consultation publique des offres sur une carte ;
- la publication d'offres par les employeurs ;
- la candidature des chercheurs d'emploi ;
- la gestion des candidatures ;
- la vérification manuelle des employeurs ;
- le signalement d'offres frauduleuses ou non conformes ;
- l'administration des utilisateurs et des offres ;
- l'export des données utilisateur ;
- la consultation de métriques nationales par les administrateurs.

La cartographie repose sur **MapLibre** et les fonds de carte de la **Géoplateforme IGN**.

Le géocodage des offres est réalisé côté back-end avec l'**API Adresse**.

---

## Prérequis

- Docker
- Docker Compose

---

## Configuration

Créer le fichier d'environnement du back-end à partir du fichier d'exemple :

```bash
cp backend/.env.example backend/.env
```

Adapter les variables d'environnement si nécessaire avant le lancement de l'application.

---

## Lancement avec Docker Compose

Depuis la racine du projet :

```bash
docker compose up -d --build
```

Vérifier l'état des services :

```bash
docker compose ps
```

Services disponibles :

- Front-end : `http://localhost:5173`
- Back-end : `http://localhost:4242`
- Swagger : `http://localhost:4242/api/docs`
- PostgreSQL : port `5432` par défaut

Pour arrêter les services :

```bash
docker compose down
```

Pour repartir avec une base PostgreSQL vide :

```bash
docker compose down -v
docker compose up -d --build
```

La commande `docker compose down -v` supprime les données PostgreSQL enregistrées dans le volume Docker.

---

## Initialisation des données

### Seed principal

Le seed principal crée les comptes et les données nécessaires à une utilisation de démonstration.

```bash
docker compose exec backend npm run seed
```

Fichier associé :

```text
backend/seed.ts
```

### Seed de géocodage historique



Un seed spécifique permet de simuler une ancienne offre enregistrée avec une localisation plus précise que la commune.



```bash
docker compose exec backend npm run seed-adresse
```

Fichier associé :

```text
backend/seeds/seed-adresse.ts
```

Ce seed est uniquement utilisé pour tester la reprise d'anciennes localisations précises vers une localisation limitée à la commune.

---

## Reprise des données géographiques

La procédure de reprise permet de traiter les anciennes offres contenant une localisation plus précise.

Les offres sont regéocodées avec l'API Adresse afin de conserver une localisation au niveau de la **commune**.

La précision géographique de l'offre est ensuite enregistrée avec la valeur :

```text
commune
```

La reprise peut être lancée avec :

```bash
docker compose exec backend npm run regeocode
```

Fichier associé :

```text
backend/src/jobs/scripts/regeocode.ts
```

La commande peut être interrompue puis relancée. Les offres déjà reprises correctement ne sont pas retraitées.

Pour conserver la sortie du script :

```bash
docker compose exec backend npm run regeocode | tee regeocode-output.txt
```

---

## Localisation des offres

La localisation fonctionnelle d'une offre est limitée à la **commune** renseignée par l'employeur.

La commune est une information géographique associée à l'offre et ne limite pas sa visibilité.

Les offres restent consultables à l'échelle nationale.

Les coordonnées WGS84 nécessaires au fonctionnement technique de la cartographie sont stockées en base de données.

Lorsqu'une coordonnée est exposée dans un export, elle est convertie en **Lambert-93 — EPSG:2154**.

Les coordonnées WGS84 ne sont pas exposées dans les exports.

---

## Archivage et purge des offres

Les offres sont automatiquement archivées après **30 jours**.

Les offres archivées âgées de plus de **90 jours** sont supprimées par le mécanisme de purge de l'application.

La purge peut également être exécutée manuellement :

```bash
docker compose exec backend npm run purge:jobs
```

---

## Vérification des employeurs

La vérification d'un compte employeur est réalisée manuellement par un administrateur.

Aucune vérification automatisée du SIRET n'est nécessaire.

Un administrateur peut valider ou retirer la validation d'un compte employeur depuis le panneau d'administration.

---

## Signalement des offres

Les utilisateurs peuvent signaler une offre frauduleuse ou non conforme.

Les signalements sont transmis au panneau d'administration.

Un administrateur peut ensuite :

- consulter le motif du signalement ;
- résoudre le signalement ;
- supprimer l'offre concernée si nécessaire.

---

## Tableau de bord administrateur

Le panneau d'administration contient un onglet de métriques nationales.

Les données sont calculées uniquement à partir des informations présentes dans GéoEmploi.

Les indicateurs disponibles comprennent :

- le nombre d'offres publiées ;
- le nombre de candidatures ;
- le nombre d'employeurs ;
- la répartition géographique des offres par commune.

Aucune source de données externe n'est utilisée pour calculer ces indicateurs.

---

## Export des données

GéoEmploi permet l'export des données liées au compte utilisateur.

Les exports peuvent notamment contenir :

- les informations du compte ;
- le profil utilisateur ;
- les offres publiées pour un employeur ;
- les candidatures pour un chercheur d'emploi ;
- les informations associées aux offres.

Les coordonnées géographiques éventuellement présentes dans les exports sont fournies en **Lambert-93 (EPSG:2154)**.

Les coordonnées WGS84 utilisées techniquement par la cartographie ne sont pas exposées dans les exports.

---

## Transparence et CGU

L'application contient une page publique regroupant :

- les Conditions Générales d'Utilisation ;
- les informations de transparence relatives au fonctionnement de GéoEmploi.

La section Transparence présente notamment les informations concernant :

- la gratuité de la publication des offres ;
- la granularité géographique limitée à la commune ;
- la conservation des données ;
- les informations relatives à la protection des données.

Cette page est accessible sans authentification.

---

## Documentation de l'API

L'API REST est documentée avec Swagger.

Après le lancement de l'application, la documentation est disponible à l'adresse :

```text
http://localhost:4242/api/docs
```

Swagger permet de consulter les routes disponibles ainsi que les données attendues et retournées par l'API.

---

## Tests

Les tests automatisés du back-end peuvent être exécutés avec :

```bash
docker compose exec backend npm test -- --runInBand
```

État de la suite de tests au moment du rendu :

```text
20 suites réussies
120 tests réussis
120 tests au total
```

---

## Architecture principale

```text
GeoEmploi/
├── backend/
│   ├── seed.ts
│   ├── seeds/
│   │   └── seed-adresse.ts
│   └── src/
│       ├── applications/
│       ├── auth/
│       ├── cartography/
│       ├── common/
│       ├── employers/
│       ├── export/
│       ├── jobs/
│       │   ├── entities/
│       │   │   └── job.entity.ts
│       │   ├── scripts/
│       │   │   └── regeocode.ts
│       │   ├── jobs.controller.ts
│       │   └── jobs.service.ts
│       ├── metrics/
│       ├── notifications/
│       ├── reports/
│       ├── seekers/
│       └── users/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── CSS/
│       └── pages/
├── docker-compose.yml
└── README.md
```

---

## Technologies utilisées

### Back-end

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Swagger
- Jest

### Front-end

- React
- Vite
- MapLibre
- React Router
- i18next

### Infrastructure

- Docker
- Docker Compose

### Services cartographiques

- Géoplateforme IGN
- API Adresse
