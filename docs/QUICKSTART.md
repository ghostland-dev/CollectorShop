# 🚀 Démarrage rapide — Collector.shop

## ⚡ En 3 commandes

```bash
# 1. Cloner le projet
git clone <repository-url>
cd "CUBES | 3/Individuel"

# 2. Setup complet (installe tout)
make setup

# 3. Démarrer le développement
make dev
```

**C'est tout !** 🎉 Ouvrez http://localhost:3000

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js** ≥ 20.0.0 ([télécharger](https://nodejs.org/))
- ✅ **npm** ≥ 10.0.0 (inclus avec Node.js)
- ✅ **Docker** et **Docker Compose** ([installer](https://docs.docker.com/get-docker/))
- ✅ **Make** (pré-installé sur Linux/macOS, [installer sur Windows](https://gnuwin32.sourceforge.net/packages/make.htm))

### Vérifier les versions

```bash
node --version   # v20.10.0 ou supérieur
npm --version    # v10.2.0 ou supérieur
docker --version # Docker version 24.0.0 ou supérieur
make --version   # GNU Make 4.0 ou supérieur
```

---

## 🎯 Commandes essentielles

### Développement

```bash
make dev          # Démarre backend + frontend
make docker-up    # Démarre les services Docker (DB, Redis, MinIO, etc.)
make status       # Vérifie l'état des services
```

### Tests

```bash
make test         # Lance tous les tests
make test-coverage # Tests avec couverture
make check        # Lint + tests (avant commit)
```

### Base de données

```bash
make seed         # Remplit la DB avec des données de test
make prisma-studio # Ouvre l'interface graphique de la DB
make migrate      # Applique les migrations
```

### Monitoring

```bash
make grafana      # Ouvre Grafana (métriques)
make minio        # Ouvre MinIO Console (images)
make urls         # Affiche toutes les URLs
```

### Nettoyage

```bash
make clean        # Nettoie les fichiers générés
make reset        # Reset complet du projet
```

---

## 🔗 URLs importantes

Après `make setup`, ces services sont disponibles :

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:5000 | - |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |
| **Metrics** | http://localhost:5000/metrics | - |
| **Health Check** | http://localhost:5000/health | - |

---

## 👤 Comptes de test

Après `make seed`, ces comptes sont disponibles :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@collector.shop | password123 | ADMIN |
| vendeur1@collector.shop | password123 | SELLER |
| vendeur2@collector.shop | password123 | SELLER |
| acheteur1@collector.shop | password123 | BUYER |
| acheteur2@collector.shop | password123 | BUYER |

---

## 📚 Documentation complète

Pour plus de détails, consultez :

- **README.md** — Documentation principale (900+ lignes)
- **docs/INSTALLATION.md** — Guide d'installation détaillé
- **docs/MAKEFILE.md** — Guide complet du Makefile (50+ commandes)
- **docs/ARCHITECTURE.md** — Architecture technique avec diagrammes
- **docs/MONITORING.md** — Guide de monitoring (VictoriaMetrics/Grafana)
- **SECURITY.md** — Politique de sécurité
- **AUDIT_FINAL.md** — Rapport d'audit final (pour le jury)

---

## 🛠️ Workflow de développement

### 1. Première installation

```bash
make setup
```

Cette commande exécute automatiquement :
1. Installation des dépendances (npm install)
2. Génération du client Prisma
3. Application des migrations DB
4. Seed de la DB avec données de test
5. Démarrage de tous les services Docker

### 2. Développement quotidien

```bash
# Matin : démarrer les services
make docker-up
make dev

# Développement...
# (le code est rechargé automatiquement)

# Avant commit
make check  # Lint + tests

# Soir : arrêter les services
make docker-down
```

### 3. Tests

```bash
# Tests unitaires
make test

# Tests avec couverture
make test-coverage

# Tests de charge
make load-test
```

---

## 🆘 Dépannage

### Problème : Port déjà utilisé

**Erreur** : `Error: listen EADDRINUSE: address already in use :::5000`

**Solution** :
```bash
# Trouver le processus utilisant le port
lsof -i :5000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
PORT=5001 make dev-backend
```

### Problème : Docker non démarré

**Erreur** : `Cannot connect to the Docker daemon`

**Solution** :
```bash
# Démarrer Docker Desktop (macOS/Windows)
# Ou démarrer le service Docker (Linux)
sudo systemctl start docker
```

### Problème : Base de données vide

**Erreur** : Pas de données dans l'application

**Solution** :
```bash
make seed
```

### Problème : Erreur de migration

**Erreur** : `Prisma migrate failed`

**Solution** :
```bash
# Reset complet de la DB
make migrate-reset

# Ou synchronisation forcée
make db-push
```

### Problème : node_modules corrompus

**Erreur** : Erreurs bizarres lors de l'installation

**Solution** :
```bash
make clean
make install
```

---

## 💡 Astuces

### Voir toutes les commandes disponibles

```bash
make help
```

### Voir les logs en temps réel

```bash
make docker-logs
```

### Accéder à la base de données

```bash
make shell-db
# Puis exécuter des requêtes SQL
# SELECT * FROM "User";
```

### Sauvegarder la base de données

```bash
make backup-db
# Crée un fichier dans backups/
```

### Restaurer une sauvegarde

```bash
make restore-db BACKUP_FILE=backups/backup_20260131_103000.sql
```

---

## 🎓 Prochaines étapes

1. **Explorer l'application** : http://localhost:3000
2. **Tester les API** : http://localhost:5000/health
3. **Voir les métriques** : http://localhost:3001 (Grafana)
4. **Lire la documentation** : `/README.md`
5. **Consulter l'architecture** : `/docs/ARCHITECTURE.md`

---

## 🏆 Fonctionnalités principales

- ✅ **Catalogue public** : Recherche, filtres, pagination
- ✅ **Authentification** : JWT avec refresh tokens
- ✅ **RBAC** : Rôles BUYER/SELLER/ADMIN
- ✅ **Chat** : Messagerie entre utilisateurs
- ✅ **Paiement** : Simulation de paiement CB (prêt pour Stripe)
- ✅ **Fraud Detection** : Détection automatique de fraude
- ✅ **Modération** : Contrôle automatique des annonces
- ✅ **Monitoring** : VictoriaMetrics + Grafana
- ✅ **i18n** : Français/Anglais
- ✅ **a11y** : Accessibilité WCAG 2.1
- ✅ **Tests** : 82% de couverture
- ✅ **CI/CD** : Pipeline GitHub Actions (10 jobs)

---

## 📊 Stack technique

### Backend
- **Node.js 20** + TypeScript
- **Express.js** (API REST)
- **Prisma** (ORM)
- **PostgreSQL 15** (Base de données)
- **Redis 7** (Cache)
- **MinIO** (Stockage S3-compatible)
- **JWT** (Authentification)

### Frontend
- **React 18** + TypeScript
- **Material-UI** (Composants)
- **React Router v6** (Routing)
- **Zustand** (State management)
- **React Query** (Data fetching)
- **i18next** (Internationalisation)

### DevOps
- **Docker Compose** (Orchestration)
- **VictoriaMetrics** (Métriques)
- **Grafana** (Dashboards)
- **GitHub Actions** (CI/CD)
- **Snyk + Trivy** (Sécurité)

---

## 🎉 Félicitations !

Vous êtes prêt à développer sur **Collector.shop** ! 🚀

Pour toute question, consultez :
- `make help` — Liste des commandes
- `/README.md` — Documentation complète
- `/docs/` — Documentation détaillée

**Bon développement !** 💻

---

*Document créé le 31 janvier 2026*  
*Version : 1.0*
