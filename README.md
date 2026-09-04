# GéoEmploi

Application de consultation et de gestion d'offres d'emploi avec cartographie.

La cartographie repose sur MapLibre et les fonds de carte de la Géoplateforme IGN. Le géocodage des offres est centralisé côté back-end via l'API Adresse.

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
- Swagger : `http://localhost:4242`
- PostgreSQL : port `5432` par défaut

Pour arrêter les services :

```bash
docker compose down
```

Pour repartir avec une base vide :

```bash
docker compose down -v
docker compose up -d --build
```

La commande `down -v` supprime les données PostgreSQL enregistrées dans le volume Docker.

## Initialisation des données

### Seed principal

Le seed principal crée les comptes et données nécessaires à une utilisation de démonstration.

```bash
docker compose exec backend npm run seed
```

Fichier associé :

```text
backend/seed.ts
```

### Seed de géocodage historique

Le seed de géocodage permet de simuler une base déjà alimentée avec des coordonnées provenant de l'ancien service de géocodage.

```bash
docker compose exec backend npm run seed-geocode
```

Fichier associé :

```text
backend/seeds/seed-geocoding.ts
```

Ce seed est utilisé pour tester la migration des coordonnées existantes vers l'API Adresse.

## Reprise du géocodage

La procédure de reprise regéocode les offres existantes avec l'API Adresse et met à jour leur traçabilité.

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

## Fichiers principaux

```text
GeoEmploi/
├── backend/
│   ├── seed.ts
│   ├── seeds/
│   │   └── seed-geocoding.ts
│   └── src/
│       ├── jobs/
│       │   ├── entities/
│       │   │   └── job.entity.ts
│       │   ├── scripts/
│       │   │   └── regeocode.ts
│       │   ├── jobs.controller.ts
│       │   └── jobs.service.ts
│       ├── users/
│       ├── employers/
│       ├── seekers/
│       ├── applications/
│       └── auth/
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── MapPage.jsx
│       └── CSS/
│           └── MapPage.css
├── doc/
├── docker-compose.yml
└── README.md
```

## Documentation

Les éléments de validation de la migration sont regroupés dans :

```text
doc/
```

Structure:

```text
doc/
├── note-migration-geoemploi.pdf
├── carte-avant.png
├── carte-apres.png
└── regeocode-output.txt
```

La sortie `regeocode-output.txt` correspond à la sortie brute de la commande de reprise.

