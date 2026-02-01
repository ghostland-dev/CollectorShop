# Guide du Makefile — Collector.shop

## 📋 Vue d'ensemble

Le **Makefile** simplifie toutes les opérations courantes du projet avec plus de **50 commandes** organisées par catégorie.

### Avantages

✅ **Simplicité** : Une seule commande au lieu de plusieurs  
✅ **Cohérence** : Même commande sur tous les environnements  
✅ **Documentation** : `make help` affiche toutes les commandes  
✅ **Productivité** : Automatisation des tâches répétitives  
✅ **Sécurité** : Confirmations pour les actions destructives  

---

## 🚀 Démarrage rapide

### Première installation

```bash
# Setup complet (installe tout et démarre les services)
make setup
```

Cette commande exécute automatiquement :
1. `make install` — Installe les dépendances
2. `make prisma-generate` — Génère le client Prisma
3. `make migrate` — Applique les migrations
4. `make seed` — Remplit la DB avec des données de test
5. `make docker-up` — Démarre tous les services Docker

### Développement quotidien

```bash
# Démarrer l'environnement de développement
make dev

# Vérifier le code avant commit
make check

# Voir le statut des services
make status
```

---

## 📚 Commandes par catégorie

### 🆘 Aide

```bash
make help          # Affiche toutes les commandes disponibles (avec descriptions)
```

### 📦 Installation

```bash
make install              # Installe toutes les dépendances (backend + frontend)
make install-backend      # Installe uniquement le backend
make install-frontend     # Installe uniquement le frontend
```

### 🛠️ Développement

```bash
make dev                  # Démarre backend + frontend en mode dev
make dev-backend          # Démarre uniquement le backend
make dev-frontend         # Démarre uniquement le frontend
```

### 🔨 Build

```bash
make build                # Build backend + frontend
make build-backend        # Build backend uniquement
make build-frontend       # Build frontend uniquement
```

### 🧪 Tests

```bash
make test                 # Lance tous les tests (backend + frontend)
make test-backend         # Lance les tests backend
make test-frontend        # Lance les tests frontend
make test-coverage        # Lance les tests avec couverture
make test-watch           # Lance les tests en mode watch
make load-test            # Lance les tests de charge (Artillery)
make load-test-report     # Tests de charge + rapport HTML
```

### 🔍 Qualité du code

```bash
make lint                 # Vérifie le code (ESLint)
make lint-fix             # Corrige automatiquement les erreurs
make format               # Formate le code (Prettier)
make audit                # Audit de sécurité des dépendances
make audit-fix            # Corrige les vulnérabilités automatiquement
```

### 🐳 Docker

```bash
make docker-up            # Démarre tous les services Docker
make docker-down          # Arrête tous les services Docker
make docker-restart       # Redémarre tous les services
make docker-build         # Build les images Docker
make docker-clean         # Nettoie les volumes (⚠️ SUPPRIME LES DONNÉES)
make docker-logs          # Affiche les logs de tous les services
make docker-logs-backend  # Affiche les logs du backend
make docker-logs-frontend # Affiche les logs du frontend
make docker-ps            # Liste les conteneurs en cours d'exécution
```

### 🗄️ Base de données

```bash
make migrate              # Applique les migrations Prisma
make migrate-deploy       # Applique les migrations en production
make migrate-reset        # Reset la DB (⚠️ SUPPRIME LES DONNÉES)
make seed                 # Remplit la DB avec des données de test
make prisma-generate      # Génère le client Prisma
make prisma-studio        # Ouvre Prisma Studio (GUI pour la DB)
make db-push              # Synchronise le schéma avec la DB (dev uniquement)
```

### 📊 Monitoring

```bash
make grafana              # Ouvre Grafana dans le navigateur
make minio                # Ouvre MinIO Console dans le navigateur
make metrics              # Affiche les métriques Prometheus
make health               # Vérifie la santé de l'application
```

### 🧹 Nettoyage

```bash
make clean                # Nettoie les fichiers générés (node_modules, dist, coverage)
make clean-cache          # Nettoie les caches npm
```

### 🚀 Déploiement

```bash
make deploy-staging       # Déploie en staging (à personnaliser)
make deploy-production    # Déploie en production (à personnaliser)
```

### 🔧 Utilitaires

```bash
make setup                # Setup complet du projet (première installation)
make reset                # Reset complet du projet
make check                # Vérifie le code (lint + tests)
make ci                   # Simule le pipeline CI
make status               # Affiche le statut des services
make urls                 # Affiche toutes les URLs utiles
make docs                 # Liste la documentation disponible
make version              # Affiche les versions des outils
```

### 🔬 Développement avancé

```bash
make fix-images           # Corrige les URLs d'images
make backup-db            # Sauvegarde la base de données
make restore-db           # Restaure la DB (nécessite BACKUP_FILE=...)
make shell-backend        # Ouvre un shell dans le conteneur backend
make shell-db             # Ouvre un shell PostgreSQL
make shell-redis          # Ouvre un shell Redis
```

---

## 💡 Cas d'usage courants

### Scénario 1 : Première installation

```bash
# Clone le projet
git clone <repository-url>
cd POC

# Setup complet (une seule commande !)
make setup

# Le projet est prêt ! Ouvrez http://localhost:3000
```

### Scénario 2 : Développement quotidien

```bash
# Matin : démarrer les services
make docker-up
make dev

# Avant commit : vérifier le code
make check

# Soir : arrêter les services
make docker-down
```

### Scénario 3 : Debugging

```bash
# Voir les logs en temps réel
make docker-logs

# Vérifier la santé des services
make status

# Ouvrir Grafana pour voir les métriques
make grafana

# Accéder à la DB
make shell-db
```

### Scénario 4 : Tests

```bash
# Tests unitaires
make test

# Tests avec couverture
make test-coverage

# Tests de charge
make docker-up
make seed
make load-test
```

### Scénario 5 : Reset complet

```bash
# Reset complet du projet (supprime tout et réinstalle)
make reset
```

### Scénario 6 : Sauvegarde/Restauration DB

```bash
# Sauvegarder la DB
make backup-db

# Restaurer une sauvegarde
make restore-db BACKUP_FILE=backups/backup_20260131_103000.sql
```

---

## 🎨 Fonctionnalités avancées

### Codes couleur

Le Makefile utilise des codes couleur pour améliorer la lisibilité :
- 🔵 **Bleu** : Actions en cours
- 🟢 **Vert** : Succès
- 🟡 **Jaune** : Avertissements
- 🔴 **Rouge** : Erreurs ou actions critiques

### Confirmations de sécurité

Les commandes destructives demandent confirmation :

```bash
make docker-clean
# ⚠️ ATTENTION: Cette commande va supprimer tous les volumes Docker
# Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...
```

### Aide contextuelle

Chaque commande a une description :

```bash
make help
# Affiche toutes les commandes avec descriptions
```

### Chaînage de commandes

Certaines commandes exécutent plusieurs actions :

```bash
make setup
# = install + prisma-generate + migrate + seed + docker-up
```

---

## 📋 Exemples d'utilisation

### Workflow de développement complet

```bash
# 1. Setup initial (une fois)
make setup

# 2. Développement
make dev

# 3. Avant commit
make lint-fix      # Corrige le formatage
make test          # Vérifie que les tests passent
make check         # Lint + tests

# 4. Commit
git add .
git commit -m "feat: nouvelle fonctionnalité"

# 5. Fin de journée
make docker-down
```

### Workflow de test

```bash
# Démarrer l'environnement
make docker-up
make seed

# Tests unitaires
make test

# Tests de charge
make load-test

# Voir les résultats dans Grafana
make grafana

# Arrêter
make docker-down
```

### Workflow de debugging

```bash
# Voir les logs
make docker-logs-backend

# Vérifier la santé
make health

# Voir les métriques
make metrics

# Accéder à la DB
make shell-db
# SELECT * FROM "User";
```

---

## 🔧 Personnalisation

### Ajouter une commande

Éditez le `Makefile` et ajoutez :

```makefile
##@ Ma catégorie

ma-commande: ## Description de ma commande
	@echo "$(BLUE)🚀 Ma commande...$(NC)"
	@# Vos commandes ici
	@echo "$(GREEN)✅ Terminé$(NC)"
```

### Variables d'environnement

Certaines commandes acceptent des variables :

```bash
# Restaurer une sauvegarde spécifique
make restore-db BACKUP_FILE=backups/backup_20260131.sql

# Déployer sur un environnement spécifique
make deploy-staging ENV=staging
```

---

## 🆘 Dépannage

### Erreur "make: command not found"

**Solution** : Installez `make` :

```bash
# Ubuntu/Debian
sudo apt-get install make

# macOS
xcode-select --install

# Windows (WSL)
sudo apt-get install make
```

### Erreur "docker-compose: command not found"

**Solution** : Installez Docker Compose :

```bash
# Voir https://docs.docker.com/compose/install/
```

### Erreur "Permission denied"

**Solution** : Ajoutez votre utilisateur au groupe docker :

```bash
sudo usermod -aG docker $USER
# Puis redémarrez votre session
```

### Commande bloquée

**Solution** : Appuyez sur `Ctrl+C` pour annuler

---

## 📊 Statistiques

Le Makefile contient :
- **50+ commandes** organisées en 13 catégories
- **Codes couleur** pour meilleure lisibilité
- **Confirmations** pour actions destructives
- **Aide contextuelle** avec `make help`
- **Chaînage** de commandes pour automatisation

---

## 🎓 Bonnes pratiques

### ✅ À faire

- Utiliser `make help` pour découvrir les commandes
- Utiliser `make setup` pour la première installation
- Utiliser `make check` avant chaque commit
- Utiliser `make status` pour vérifier l'état des services
- Utiliser `make backup-db` avant des opérations risquées

### ❌ À éviter

- Ne pas utiliser `make docker-clean` sans sauvegarde
- Ne pas utiliser `make migrate-reset` en production
- Ne pas ignorer les confirmations de sécurité

---

## 🔗 Ressources

- **Makefile** : `/Makefile`
- **Documentation principale** : `/README.md`
- **Installation** : `/docs/INSTALLATION.md`
- **Architecture** : `/docs/ARCHITECTURE.md`

---

## 💬 Support

Pour toute question sur le Makefile :
1. Utilisez `make help` pour voir toutes les commandes
2. Consultez ce document (`docs/MAKEFILE.md`)
3. Consultez le README principal

---

*Document créé le 31 janvier 2026*  
*Version : 1.0*
