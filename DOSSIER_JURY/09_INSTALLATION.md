# Guide d'installation - Collector.shop POC

## Prérequis

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker et Docker Compose (recommandé pour le développement local)
- PostgreSQL 15 (si pas de Docker)
- MinIO (inclus dans Docker Compose)

## Monitoring

Le POC intègre **VictoriaMetrics** pour le monitoring des métriques :
- Métriques Prometheus exposées sur http://localhost:5000/metrics
- VictoriaMetrics accessible sur http://localhost:8428
- Métriques automatiquement poussées toutes les 15 secondes

Voir `MONITORING.md` pour plus de détails.

## Installation locale

### 1. Cloner le repository

```bash
git clone <repository-url>
cd POC
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

#### Backend

```bash
cd backend
cp .env.example .env
```

Éditer le fichier `.env` avec vos valeurs :

#### Frontend

```bash
cd frontend
```

Créer un fichier `.env` avec :

```env
VITE_API_URL=http://localhost:5000/api
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/collector_shop?schema=public"
JWT_SECRET="votre-secret-jwt-tres-securise"
JWT_REFRESH_SECRET="votre-secret-refresh-tres-securise"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
```

### 4. Base de données

#### Option A : Avec Docker Compose (Recommandé)

```bash
# Démarrer tous les services (PostgreSQL, Redis, MinIO)
docker-compose up -d postgres redis minio

# Ou démarrer tous les services incluant backend et frontend
docker-compose up -d
```

**MinIO Console** : Accessible sur http://localhost:9001
- Identifiants : `minioadmin` / `minioadmin123`

#### Option B : Installation manuelle PostgreSQL

```bash
# Créer la base de données
createdb collector_shop

# Exécuter les migrations
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Démarrer l'application

#### Mode développement

```bash
# Depuis la racine du projet
npm run dev
```

Cela démarre :
- Backend sur http://localhost:5000
- Frontend sur http://localhost:3000

#### Mode production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Seed de la base de données

Pour remplir la base de données avec des données de test (utilisateurs et annonces) :

```bash
cd backend
npm run prisma:seed
```

Cela créera :
- **6 utilisateurs** : 1 admin, 3 vendeurs, 2 acheteurs
- **12 annonces** dans différentes catégories (Philatélie, Numismatique, Cartes)
- **1 achat** de test

**Comptes de test créés** (mot de passe pour tous : `password123`) :
- Admin: `admin@collector.shop`
- Vendeur 1: `vendeur1@collector.shop`
- Vendeur 2: `vendeur2@collector.shop`
- Vendeur 3: `vendeur3@collector.shop`
- Acheteur 1: `acheteur1@collector.shop`
- Acheteur 2: `acheteur2@collector.shop`

## Tests

### Tests unitaires

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### Tests avec couverture

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

### Tests d'intégration

Les tests d'intégration sont inclus dans la suite de tests Jest (backend).

## Utilisation de l'API

### Exemples d'appels

#### Inscription

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendeur@example.com",
    "password": "password123",
    "firstName": "Jean",
    "lastName": "Dupont"
  }'
```

#### Connexion

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendeur@example.com",
    "password": "password123"
  }'
```

#### Créer une annonce (nécessite authentification)

```bash
curl -X POST http://localhost:5000/api/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Timbre rare 1950",
    "description": "Timbre en excellent état, collection privée",
    "price": 150.00,
    "category": "Philatélie",
    "images": ["https://example.com/image.jpg"]
  }'
```

#### Lister les annonces

```bash
curl http://localhost:5000/api/announcements?category=Philatélie&search=timbre
```

#### Upload d'une image (nécessite authentification)

```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

#### Upload de plusieurs images

```bash
curl -X POST http://localhost:5000/api/upload/images \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

#### Consulter les métriques Prometheus

```bash
curl http://localhost:5000/metrics
```

#### Consulter VictoriaMetrics

```bash
# Health check
curl http://localhost:8428/health

# Query metrics
curl "http://localhost:8428/api/v1/query?query=up"
```

## Structure du projet

```
POC/
├── backend/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── routes/          # Routes API
│   │   ├── utils/           # Utilitaires (auth, logger)
│   │   ├── services/        # Services métier
│   │   ├── middleware/      # Middlewares Express
│   │   ├── __tests__/       # Tests unitaires et d'intégration
│   │   └── index.ts         # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma de base de données
│   │   ├── migrations/      # Migrations Prisma
│   │   └── seed.ts          # Seed de la base de données
│   ├── scripts/             # Scripts utilitaires
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/         # Services API
│   │   ├── stores/          # Stores Zustand
│   │   ├── hooks/           # Hooks React personnalisés
│   │   └── __tests__/       # Tests unitaires
│   ├── Dockerfile
│   └── package.json
├── tests/                   # Tests du projet
│   ├── load-tests/          # Tests de charge et performance
│   │   ├── artillery.yml    # Configuration Artillery
│   │   └── load-test.ts     # Fonctions TypeScript personnalisées
│   └── README.md            # Documentation des tests
├── docs/                    # Documentation
│   ├── INSTALLATION.md      # Guide d'installation
│   └── MONITORING.md        # Guide de monitoring
├── grafana/                 # Configuration Grafana
│   ├── dashboards/          # Dashboards JSON
│   └── provisioning/        # Configuration automatique
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # Pipeline CI/CD
├── docker-compose.yml       # Configuration Docker Compose
├── package.json             # Configuration workspace racine
└── README.md                # Documentation principale
```

## Dépannage

### Erreur "Erreur lors du chargement du catalogue"

Cette erreur peut avoir plusieurs causes :

1. **Backend non démarré**
   ```bash
   # Vérifier si le backend est en cours d'exécution
   curl http://localhost:5000/health
   
   # Si pas de réponse, démarrer le backend
   cd backend
   npm run dev
   ```

2. **Base de données vide**
   ```bash
   # Exécuter le seed pour créer des données de test
   cd backend
   npm run prisma:seed
   ```

3. **Problème de CORS**
   - Vérifier que `FRONTEND_URL` dans `.env` du backend correspond à l'URL du frontend
   - Par défaut : `FRONTEND_URL=http://localhost:3000`

4. **URL API incorrecte**
   - Vérifier la variable d'environnement `VITE_API_URL` dans le frontend
   - Par défaut : `http://localhost:5000/api`

5. **Script de diagnostic**
   ```bash
   ./check-api.sh
   ```

### Erreur de connexion à la base de données

Vérifier que PostgreSQL est démarré et que les credentials dans `.env` sont corrects.

```bash
# Avec Docker Compose
docker-compose ps postgres

# Tester la connexion
psql -h localhost -U collector -d collector_shop
```

### Erreur Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### Port déjà utilisé

Modifier le port dans `.env` ou arrêter le processus utilisant le port.

```bash
# Trouver le processus utilisant le port 5000
lsof -i :5000

# Ou pour le port 3000
lsof -i :3000
```

## Support

Pour toute question, consulter la documentation dans `README.md` ou ouvrir une issue.
