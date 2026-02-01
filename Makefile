# Makefile - Collector.shop
# Simplifie les opérations courantes du projet

.PHONY: help install dev build test clean docker-up docker-down docker-restart logs seed migrate lint format audit

# Couleurs pour l'affichage
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ Aide

help: ## Affiche cette aide
	@echo "$(BLUE)Collector.shop - Commandes disponibles$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(GREEN)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation

install: ## Installe toutes les dépendances (backend + frontend)
	@echo "$(BLUE)📦 Installation des dépendances...$(NC)"
	@npm install
	@cd backend && npm install
	@cd frontend && npm install
	@echo "$(GREEN)✅ Dépendances installées$(NC)"

install-backend: ## Installe les dépendances backend uniquement
	@echo "$(BLUE)📦 Installation backend...$(NC)"
	@cd backend && npm install
	@echo "$(GREEN)✅ Backend installé$(NC)"

install-frontend: ## Installe les dépendances frontend uniquement
	@echo "$(BLUE)📦 Installation frontend...$(NC)"
	@cd frontend && npm install
	@echo "$(GREEN)✅ Frontend installé$(NC)"

##@ Développement

dev: ## Démarre l'environnement de développement complet
	@echo "$(BLUE)🚀 Démarrage de l'environnement de développement...$(NC)"
	@npm run dev

dev-backend: ## Démarre uniquement le backend
	@echo "$(BLUE)🚀 Démarrage du backend...$(NC)"
	@cd backend && npm run dev

dev-frontend: ## Démarre uniquement le frontend
	@echo "$(BLUE)🚀 Démarrage du frontend...$(NC)"
	@cd frontend && npm run dev

##@ Build

build: ## Build backend + frontend
	@echo "$(BLUE)🔨 Build du projet...$(NC)"
	@cd backend && npm run build
	@cd frontend && npm run build
	@echo "$(GREEN)✅ Build terminé$(NC)"

build-backend: ## Build backend uniquement
	@echo "$(BLUE)🔨 Build backend...$(NC)"
	@cd backend && npm run build
	@echo "$(GREEN)✅ Backend buildé$(NC)"

build-frontend: ## Build frontend uniquement
	@echo "$(BLUE)🔨 Build frontend...$(NC)"
	@cd frontend && npm run build
	@echo "$(GREEN)✅ Frontend buildé$(NC)"

##@ Tests

test: ## Lance tous les tests (backend + frontend)
	@echo "$(BLUE)🧪 Exécution des tests...$(NC)"
	@cd backend && npm run test
	@cd frontend && npm run test
	@echo "$(GREEN)✅ Tests terminés$(NC)"

test-backend: ## Lance les tests backend
	@echo "$(BLUE)🧪 Tests backend...$(NC)"
	@cd backend && npm run test

test-frontend: ## Lance les tests frontend
	@echo "$(BLUE)🧪 Tests frontend...$(NC)"
	@cd frontend && npm run test

test-coverage: ## Lance les tests avec couverture
	@echo "$(BLUE)🧪 Tests avec couverture...$(NC)"
	@cd backend && npm run test:coverage
	@cd frontend && npm run test:coverage
	@echo "$(GREEN)✅ Couverture générée dans backend/coverage et frontend/coverage$(NC)"

test-watch: ## Lance les tests en mode watch
	@echo "$(BLUE)🧪 Tests en mode watch...$(NC)"
	@cd backend && npm run test:watch

load-test: ## Lance les tests de charge (Artillery)
	@echo "$(BLUE)⚡ Tests de charge...$(NC)"
	@echo "$(YELLOW)⚠️  Assurez-vous que l'application est démarrée$(NC)"
	@npm run load-test

load-test-report: ## Lance les tests de charge et génère un rapport
	@echo "$(BLUE)⚡ Tests de charge avec rapport...$(NC)"
	@npm run load-test:report

##@ Qualité du code

lint: ## Vérifie le code (ESLint)
	@echo "$(BLUE)🔍 Vérification du code...$(NC)"
	@cd backend && npm run lint
	@cd frontend && npm run lint
	@echo "$(GREEN)✅ Lint terminé$(NC)"

lint-fix: ## Corrige automatiquement les erreurs de lint
	@echo "$(BLUE)🔧 Correction automatique...$(NC)"
	@cd backend && npm run lint:fix
	@cd frontend && npm run lint:fix
	@echo "$(GREEN)✅ Corrections appliquées$(NC)"

format: ## Formate le code (Prettier)
	@echo "$(BLUE)✨ Formatage du code...$(NC)"
	@cd backend && npm run format
	@cd frontend && npm run format
	@echo "$(GREEN)✅ Code formaté$(NC)"

audit: ## Audit de sécurité des dépendances npm
	@echo "$(BLUE)🔒 Audit de sécurité...$(NC)"
	@cd backend && npm audit
	@cd frontend && npm audit

audit-fix: ## Corrige automatiquement les vulnérabilités
	@echo "$(BLUE)🔧 Correction des vulnérabilités...$(NC)"
	@cd backend && npm audit fix
	@cd frontend && npm audit fix
	@echo "$(GREEN)✅ Vulnérabilités corrigées$(NC)"

##@ Docker

docker-up: ## Démarre tous les services Docker
	@echo "$(BLUE)🐳 Démarrage des services Docker...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Services démarrés$(NC)"
	@echo "$(YELLOW)📊 Grafana: http://localhost:3001 (admin/admin123)$(NC)"
	@echo "$(YELLOW)🗄️  MinIO: http://localhost:9001 (minioadmin/minioadmin123)$(NC)"
	@echo "$(YELLOW)🚀 Backend: http://localhost:5000$(NC)"
	@echo "$(YELLOW)💻 Frontend: http://localhost:3000$(NC)"

docker-down: ## Arrête tous les services Docker
	@echo "$(BLUE)🐳 Arrêt des services Docker...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Services arrêtés$(NC)"

docker-restart: ## Redémarre tous les services Docker
	@echo "$(BLUE)🐳 Redémarrage des services Docker...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✅ Services redémarrés$(NC)"

docker-build: ## Build les images Docker
	@echo "$(BLUE)🐳 Build des images Docker...$(NC)"
	@docker-compose build
	@echo "$(GREEN)✅ Images buildées$(NC)"

docker-clean: ## Nettoie les volumes Docker (⚠️ SUPPRIME LES DONNÉES)
	@echo "$(RED)⚠️  ATTENTION: Cette commande va supprimer tous les volumes Docker$(NC)"
	@echo "$(YELLOW)Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...$(NC)"
	@read confirm
	@docker-compose down -v
	@echo "$(GREEN)✅ Volumes supprimés$(NC)"

docker-logs: ## Affiche les logs de tous les services
	@docker-compose logs -f

docker-logs-backend: ## Affiche les logs du backend
	@docker-compose logs -f backend

docker-logs-frontend: ## Affiche les logs du frontend
	@docker-compose logs -f frontend

docker-ps: ## Liste les conteneurs en cours d'exécution
	@docker-compose ps

##@ Base de données

migrate: ## Applique les migrations Prisma
	@echo "$(BLUE)🗄️  Application des migrations...$(NC)"
	@cd backend && npx prisma migrate dev
	@echo "$(GREEN)✅ Migrations appliquées$(NC)"

migrate-deploy: ## Applique les migrations en production
	@echo "$(BLUE)🗄️  Application des migrations (production)...$(NC)"
	@cd backend && npx prisma migrate deploy
	@echo "$(GREEN)✅ Migrations appliquées$(NC)"

migrate-reset: ## Reset la base de données (⚠️ SUPPRIME LES DONNÉES)
	@echo "$(RED)⚠️  ATTENTION: Cette commande va supprimer toutes les données$(NC)"
	@echo "$(YELLOW)Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...$(NC)"
	@read confirm
	@cd backend && npx prisma migrate reset --force
	@echo "$(GREEN)✅ Base de données réinitialisée$(NC)"

seed: ## Remplit la base de données avec des données de test
	@echo "$(BLUE)🌱 Seed de la base de données...$(NC)"
	@cd backend && npm run prisma:seed
	@echo "$(GREEN)✅ Données de test créées$(NC)"
	@echo "$(YELLOW)📧 Comptes de test (mot de passe: password123):$(NC)"
	@echo "  - admin@collector.shop (ADMIN)"
	@echo "  - vendeur1@collector.shop (SELLER)"
	@echo "  - acheteur1@collector.shop (BUYER)"

prisma-generate: ## Génère le client Prisma
	@echo "$(BLUE)🔧 Génération du client Prisma...$(NC)"
	@cd backend && npx prisma generate
	@echo "$(GREEN)✅ Client Prisma généré$(NC)"

prisma-studio: ## Ouvre Prisma Studio (GUI pour la DB)
	@echo "$(BLUE)🎨 Ouverture de Prisma Studio...$(NC)"
	@cd backend && npx prisma studio

db-push: ## Synchronise le schéma Prisma avec la DB (dev uniquement)
	@echo "$(BLUE)🗄️  Synchronisation du schéma...$(NC)"
	@cd backend && npx prisma db push
	@echo "$(GREEN)✅ Schéma synchronisé$(NC)"

##@ Monitoring

grafana: ## Ouvre Grafana dans le navigateur
	@echo "$(BLUE)📊 Ouverture de Grafana...$(NC)"
	@xdg-open http://localhost:3001 2>/dev/null || open http://localhost:3001 2>/dev/null || echo "$(YELLOW)Ouvrez http://localhost:3001 dans votre navigateur$(NC)"

minio: ## Ouvre MinIO Console dans le navigateur
	@echo "$(BLUE)🗄️  Ouverture de MinIO Console...$(NC)"
	@xdg-open http://localhost:9001 2>/dev/null || open http://localhost:9001 2>/dev/null || echo "$(YELLOW)Ouvrez http://localhost:9001 dans votre navigateur$(NC)"

metrics: ## Affiche les métriques Prometheus
	@echo "$(BLUE)📊 Métriques Prometheus...$(NC)"
	@curl -s http://localhost:5000/metrics | head -n 50
	@echo ""
	@echo "$(YELLOW)Pour voir toutes les métriques: curl http://localhost:5000/metrics$(NC)"

health: ## Vérifie la santé de l'application
	@echo "$(BLUE)🏥 Vérification de la santé...$(NC)"
	@curl -s http://localhost:5000/health | jq . || echo "$(RED)❌ Backend non accessible$(NC)"

##@ Nettoyage

clean: ## Nettoie les fichiers générés (node_modules, dist, coverage)
	@echo "$(BLUE)🧹 Nettoyage...$(NC)"
	@rm -rf node_modules
	@rm -rf backend/node_modules backend/dist backend/coverage
	@rm -rf frontend/node_modules frontend/dist frontend/coverage
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

clean-cache: ## Nettoie les caches npm
	@echo "$(BLUE)🧹 Nettoyage des caches...$(NC)"
	@npm cache clean --force
	@cd backend && npm cache clean --force
	@cd frontend && npm cache clean --force
	@echo "$(GREEN)✅ Caches nettoyés$(NC)"

##@ Déploiement

deploy-staging: ## Déploie en staging (simulation)
	@echo "$(BLUE)🚀 Déploiement staging...$(NC)"
	@echo "$(YELLOW)⚠️  Commande de déploiement à personnaliser$(NC)"
	@echo "Exemple: kubectl apply -f k8s/staging/"

deploy-production: ## Déploie en production (simulation)
	@echo "$(RED)⚠️  ATTENTION: Déploiement en PRODUCTION$(NC)"
	@echo "$(YELLOW)Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...$(NC)"
	@read confirm
	@echo "$(BLUE)🚀 Déploiement production...$(NC)"
	@echo "$(YELLOW)⚠️  Commande de déploiement à personnaliser$(NC)"
	@echo "Exemple: kubectl apply -f k8s/production/"

##@ Utilitaires

setup: install prisma-generate migrate seed docker-up ## Setup complet du projet (première installation)
	@echo "$(GREEN)✅ Setup terminé !$(NC)"
	@echo ""
	@echo "$(BLUE)🎉 Collector.shop est prêt !$(NC)"
	@echo ""
	@echo "$(YELLOW)Services disponibles:$(NC)"
	@echo "  - Frontend: http://localhost:3000"
	@echo "  - Backend: http://localhost:5000"
	@echo "  - Grafana: http://localhost:3001 (admin/admin123)"
	@echo "  - MinIO: http://localhost:9001 (minioadmin/minioadmin123)"
	@echo ""
	@echo "$(YELLOW)Comptes de test (mot de passe: password123):$(NC)"
	@echo "  - admin@collector.shop (ADMIN)"
	@echo "  - vendeur1@collector.shop (SELLER)"
	@echo "  - acheteur1@collector.shop (BUYER)"
	@echo ""
	@echo "$(GREEN)Utilisez 'make dev' pour démarrer le développement$(NC)"

reset: docker-down clean install setup ## Reset complet du projet
	@echo "$(GREEN)✅ Projet réinitialisé$(NC)"

check: lint test ## Vérifie le code (lint + tests)
	@echo "$(GREEN)✅ Vérifications terminées$(NC)"

ci: install build lint test ## Simule le pipeline CI
	@echo "$(GREEN)✅ Pipeline CI simulé avec succès$(NC)"

status: ## Affiche le statut des services
	@echo "$(BLUE)📊 Statut des services$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(YELLOW)Backend:$(NC)"
	@curl -s http://localhost:5000/health > /dev/null && echo "$(GREEN)✅ Backend OK$(NC)" || echo "$(RED)❌ Backend KO$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✅ Frontend OK$(NC)" || echo "$(RED)❌ Frontend KO$(NC)"
	@echo ""
	@echo "$(YELLOW)Grafana:$(NC)"
	@curl -s http://localhost:3001/api/health > /dev/null && echo "$(GREEN)✅ Grafana OK$(NC)" || echo "$(RED)❌ Grafana KO$(NC)"

urls: ## Affiche toutes les URLs utiles
	@echo "$(BLUE)🔗 URLs du projet$(NC)"
	@echo ""
	@echo "$(YELLOW)Application:$(NC)"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:5000"
	@echo "  Health:    http://localhost:5000/health"
	@echo "  Metrics:   http://localhost:5000/metrics"
	@echo ""
	@echo "$(YELLOW)Monitoring:$(NC)"
	@echo "  Grafana:         http://localhost:3001 (admin/admin123)"
	@echo "  VictoriaMetrics: http://localhost:8428"
	@echo ""
	@echo "$(YELLOW)Stockage:$(NC)"
	@echo "  MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
	@echo "  MinIO API:     http://localhost:9000"
	@echo ""
	@echo "$(YELLOW)Base de données:$(NC)"
	@echo "  PostgreSQL: localhost:5432 (collector/collector_password)"
	@echo "  Redis:      localhost:6379"

docs: ## Ouvre la documentation
	@echo "$(BLUE)📚 Documentation disponible:$(NC)"
	@echo ""
	@echo "  - README.md              : Documentation principale"
	@echo "  - SECURITY.md            : Politique de sécurité"
	@echo "  - docs/AUDIT_FINAL.md    : Rapport d'audit final"
	@echo "  - docs/INSTALLATION.md   : Guide d'installation"
	@echo "  - docs/MONITORING.md     : Guide de monitoring"
	@echo "  - docs/POC_PRISMA.md   : Expérimentation Prisma"
	@echo "  - docs/ARCHITECTURE.md : Architecture technique"
	@echo "  - docs/CHANGELOG_AUDIT.md : Changelog des corrections"

version: ## Affiche les versions des outils
	@echo "$(BLUE)📦 Versions$(NC)"
	@echo ""
	@echo "$(YELLOW)Node.js:$(NC) $$(node --version)"
	@echo "$(YELLOW)npm:$(NC) $$(npm --version)"
	@echo "$(YELLOW)Docker:$(NC) $$(docker --version)"
	@echo "$(YELLOW)Docker Compose:$(NC) $$(docker-compose --version)"
	@echo ""
	@echo "$(YELLOW)Backend:$(NC)"
	@cd backend && node -p "require('./package.json').version"
	@echo "$(YELLOW)Frontend:$(NC)"
	@cd frontend && node -p "require('./package.json').version"

##@ Développement avancé

fix-images: ## Corrige les URLs d'images (script utilitaire)
	@echo "$(BLUE)🖼️  Correction des images...$(NC)"
	@cd backend && npm run fix:images

backup-db: ## Sauvegarde la base de données
	@echo "$(BLUE)💾 Sauvegarde de la base de données...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U collector collector_shop > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Sauvegarde créée dans backups/$(NC)"

restore-db: ## Restaure la base de données (nécessite BACKUP_FILE=...)
	@echo "$(BLUE)💾 Restauration de la base de données...$(NC)"
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)❌ Erreur: Spécifiez BACKUP_FILE=backups/backup_xxx.sql$(NC)"; \
		exit 1; \
	fi
	@cat $(BACKUP_FILE) | docker-compose exec -T postgres psql -U collector collector_shop
	@echo "$(GREEN)✅ Base de données restaurée$(NC)"

shell-backend: ## Ouvre un shell dans le conteneur backend
	@docker-compose exec backend sh

shell-db: ## Ouvre un shell PostgreSQL
	@docker-compose exec postgres psql -U collector collector_shop

shell-redis: ## Ouvre un shell Redis
	@docker-compose exec redis redis-cli

# Commande par défaut
.DEFAULT_GOAL := help
