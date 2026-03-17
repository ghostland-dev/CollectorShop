# Makefile - Collector.shop
# Simplifie les opérations courantes du projet

.PHONY: help install dev build test clean docker-up docker-down docker-restart logs seed migrate lint format audit k8s-start k8s-stop k8s-restart k8s-status k8s-logs k8s-urls k8s-clean jenkins-build jenkins-start jenkins-stop jenkins-restart jenkins-logs jenkins-open jenkins-clean jenkins-status argocd-install argocd-open argocd-password argocd-status argocd-sync argocd-history argocd-rollback argocd-app-delete argocd-clean netdata-install netdata-open netdata-status netdata-logs netdata-clean infra-up infra-down infra-status

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

##@ Jenkins CI/CD Local

jenkins-build: ## Build l'image Docker Jenkins (Node.js 20 + Docker CLI + Trivy)
	@echo "$(BLUE)🔨 Build de l'image Jenkins...$(NC)"
	@docker-compose -f docker-compose.jenkins.yml build --no-cache
	@echo "$(GREEN)✅ Image Jenkins construite$(NC)"

jenkins-start: ## Démarre Jenkins (http://localhost:8080 — admin/admin)
	@echo "$(BLUE)🚀 Démarrage de Jenkins...$(NC)"
	@docker-compose -f docker-compose.jenkins.yml up -d
	@echo "$(GREEN)✅ Jenkins démarré$(NC)"
	@echo ""
	@echo "$(YELLOW)⏳ Jenkins initialise ses plugins (~2 min au premier démarrage)$(NC)"
	@echo "$(YELLOW)📊 Interface : http://localhost:8080$(NC)"
	@echo "$(YELLOW)🔑 Identifiants : admin / admin$(NC)"
	@echo "$(YELLOW)📋 Job créé automatiquement : collector-shop-pipeline$(NC)"

jenkins-stop: ## Arrête Jenkins
	@echo "$(BLUE)🛑 Arrêt de Jenkins...$(NC)"
	@docker-compose -f docker-compose.jenkins.yml down
	@echo "$(GREEN)✅ Jenkins arrêté$(NC)"

jenkins-restart: ## Redémarre Jenkins
	@echo "$(BLUE)🔄 Redémarrage de Jenkins...$(NC)"
	@docker-compose -f docker-compose.jenkins.yml restart
	@echo "$(GREEN)✅ Jenkins redémarré$(NC)"

jenkins-logs: ## Affiche les logs Jenkins en temps réel
	@docker-compose -f docker-compose.jenkins.yml logs -f jenkins

jenkins-open: ## Ouvre l'interface Jenkins dans le navigateur
	@echo "$(BLUE)🌐 Ouverture de Jenkins...$(NC)"
	@xdg-open http://localhost:8080 2>/dev/null || open http://localhost:8080 2>/dev/null || echo "$(YELLOW)Ouvrez http://localhost:8080 dans votre navigateur$(NC)"

jenkins-clean: ## Supprime Jenkins et ses données (⚠️ IRRÉVERSIBLE)
	@echo "$(RED)⚠️  ATTENTION: Suppression de Jenkins et de toutes ses données$(NC)"
	@echo "$(YELLOW)Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...$(NC)"
	@read confirm
	@docker-compose -f docker-compose.jenkins.yml down -v
	@docker volume rm collector-shop-jenkins-home 2>/dev/null || true
	@echo "$(GREEN)✅ Jenkins et ses données supprimés$(NC)"

jenkins-status: ## Affiche le statut de Jenkins
	@echo "$(BLUE)📊 Statut Jenkins$(NC)"
	@docker-compose -f docker-compose.jenkins.yml ps
	@echo ""
	@curl -s http://localhost:8080/login > /dev/null && echo "$(GREEN)✅ Jenkins accessible : http://localhost:8080$(NC)" || echo "$(RED)❌ Jenkins non accessible$(NC)"

##@ Kubernetes (Minikube)

k8s-start: ## Démarre et déploie sur Minikube
	@echo "$(BLUE)🚀 Déploiement sur Minikube...$(NC)"
	@./deploy-minikube.sh start

k8s-stop: ## Arrête Minikube
	@echo "$(BLUE)🛑 Arrêt de Minikube...$(NC)"
	@./deploy-minikube.sh stop

k8s-restart: ## Redémarre les déploiements Kubernetes
	@echo "$(BLUE)🔄 Redémarrage des déploiements...$(NC)"
	@./deploy-minikube.sh restart

k8s-status: ## Affiche le statut des pods et services
	@echo "$(BLUE)📊 Statut Kubernetes$(NC)"
	@./deploy-minikube.sh status

k8s-logs: ## Affiche les logs (usage: make k8s-logs SERVICE=backend)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)Usage: make k8s-logs SERVICE=<backend|frontend|postgres|redis|minio|victoriametrics|grafana>$(NC)"; \
		exit 1; \
	fi
	@./deploy-minikube.sh logs $(SERVICE)

k8s-urls: ## Affiche les URLs d'accès aux services
	@echo "$(BLUE)🔗 URLs d'accès$(NC)"
	@./deploy-minikube.sh urls

k8s-clean: ## Nettoie le déploiement Kubernetes
	@echo "$(BLUE)🧹 Nettoyage Kubernetes...$(NC)"
	@./deploy-minikube.sh clean

k8s-dashboard: ## Ouvre le dashboard Kubernetes
	@echo "$(BLUE)📊 Ouverture du dashboard Kubernetes...$(NC)"
	@minikube dashboard

k8s-shell-backend: ## Ouvre un shell dans un pod backend
	@echo "$(BLUE)🐚 Shell backend...$(NC)"
	@kubectl exec -it -n collector-shop $$(kubectl get pods -n collector-shop -l app=backend -o jsonpath='{.items[0].metadata.name}') -- sh

k8s-shell-db: ## Ouvre un shell PostgreSQL dans Kubernetes
	@echo "$(BLUE)🐚 Shell PostgreSQL...$(NC)"
	@kubectl exec -it -n collector-shop $$(kubectl get pods -n collector-shop -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- psql -U collector collector_shop

k8s-pods: ## Liste tous les pods
	@echo "$(BLUE)📦 Pods Kubernetes$(NC)"
	@kubectl get pods -n collector-shop

k8s-services: ## Liste tous les services
	@echo "$(BLUE)🔌 Services Kubernetes$(NC)"
	@kubectl get services -n collector-shop

k8s-deployments: ## Liste tous les déploiements
	@echo "$(BLUE)🚀 Déploiements Kubernetes$(NC)"
	@kubectl get deployments -n collector-shop

k8s-pvc: ## Liste les PersistentVolumeClaims
	@echo "$(BLUE)💾 PersistentVolumeClaims$(NC)"
	@kubectl get pvc -n collector-shop

k8s-events: ## Affiche les événements récents
	@echo "$(BLUE)📋 Événements Kubernetes$(NC)"
	@kubectl get events -n collector-shop --sort-by='.lastTimestamp' | tail -20

k8s-describe-pod: ## Décrit un pod (usage: make k8s-describe-pod POD=<name>)
	@if [ -z "$(POD)" ]; then \
		echo "$(YELLOW)Usage: make k8s-describe-pod POD=<pod-name>$(NC)"; \
		echo "$(YELLOW)Liste des pods:$(NC)"; \
		kubectl get pods -n collector-shop; \
		exit 1; \
	fi
	@kubectl describe pod $(POD) -n collector-shop

k8s-scale-backend: ## Scale le backend (usage: make k8s-scale-backend REPLICAS=3)
	@if [ -z "$(REPLICAS)" ]; then \
		echo "$(YELLOW)Usage: make k8s-scale-backend REPLICAS=<number>$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)📈 Scaling backend à $(REPLICAS) replicas...$(NC)"
	@kubectl scale deployment backend -n collector-shop --replicas=$(REPLICAS)
	@echo "$(GREEN)✅ Backend scalé à $(REPLICAS) replicas$(NC)"

k8s-scale-frontend: ## Scale le frontend (usage: make k8s-scale-frontend REPLICAS=3)
	@if [ -z "$(REPLICAS)" ]; then \
		echo "$(YELLOW)Usage: make k8s-scale-frontend REPLICAS=<number>$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)📈 Scaling frontend à $(REPLICAS) replicas...$(NC)"
	@kubectl scale deployment frontend -n collector-shop --replicas=$(REPLICAS)
	@echo "$(GREEN)✅ Frontend scalé à $(REPLICAS) replicas$(NC)"

k8s-port-forward-backend: ## Port-forward le backend (5000:5000)
	@echo "$(BLUE)🔀 Port-forward backend 5000:5000...$(NC)"
	@kubectl port-forward -n collector-shop svc/backend 5000:5000

k8s-port-forward-frontend: ## Port-forward le frontend (3000:80)
	@echo "$(BLUE)🔀 Port-forward frontend 3000:80...$(NC)"
	@kubectl port-forward -n collector-shop svc/frontend 3000:80

k8s-port-forward-grafana: ## Port-forward Grafana (3001:3000)
	@echo "$(BLUE)🔀 Port-forward Grafana 3001:3000...$(NC)"
	@kubectl port-forward -n collector-shop svc/grafana 3001:3000

k8s-port-forward-loki: ## Port-forward Loki (3100:3100)
	@echo "$(BLUE)🔀 Port-forward Loki 3100:3100...$(NC)"
	@kubectl port-forward -n collector-shop svc/loki 3100:3100

k8s-port-forward-victoriametrics: ## Port-forward VictoriaMetrics (8428:8428)
	@echo "$(BLUE)🔀 Port-forward VictoriaMetrics 8428:8428...$(NC)"
	@kubectl port-forward -n collector-shop svc/victoriametrics 8428:8428

k8s-logs-loki: ## Affiche les logs de Loki
	@echo "$(BLUE)📋 Logs de Loki$(NC)"
	@kubectl logs -n collector-shop -l app=loki --tail=100

k8s-logs-promtail: ## Affiche les logs de Promtail
	@echo "$(BLUE)📋 Logs de Promtail$(NC)"
	@kubectl logs -n collector-shop -l app=promtail --tail=50

k8s-rebuild-backend: ## Rebuild et redéploie le backend
	@echo "$(BLUE)🔨 Rebuild backend...$(NC)"
	@eval $$(minikube docker-env) && docker build -t collector-shop-backend:latest -f backend/Dockerfile backend/
	@kubectl rollout restart deployment backend -n collector-shop
	@echo "$(GREEN)✅ Backend redéployé$(NC)"

k8s-rebuild-frontend: ## Rebuild et redéploie le frontend
	@echo "$(BLUE)🔨 Rebuild frontend...$(NC)"
	@eval $$(minikube docker-env) && docker build -t collector-shop-frontend:latest -f frontend/Dockerfile .
	@kubectl rollout restart deployment frontend -n collector-shop
	@echo "$(GREEN)✅ Frontend redéployé$(NC)"

k8s-migrate: ## Exécute les migrations Prisma dans Kubernetes
	@echo "$(BLUE)🔄 Migrations Prisma...$(NC)"
	@kubectl exec -n collector-shop $$(kubectl get pods -n collector-shop -l app=backend -o jsonpath='{.items[0].metadata.name}') -- npx prisma migrate deploy
	@echo "$(GREEN)✅ Migrations terminées$(NC)"

k8s-seed: ## Seed la base de données dans Kubernetes
	@echo "$(BLUE)🌱 Seed de la base de données...$(NC)"
	@kubectl exec -n collector-shop $$(kubectl get pods -n collector-shop -l app=backend -o jsonpath='{.items[0].metadata.name}') -- npm run prisma:seed
	@echo "$(GREEN)✅ Seed terminé$(NC)"

k8s-top: ## Affiche les métriques CPU/RAM des pods
	@echo "$(BLUE)📊 Métriques des pods$(NC)"
	@kubectl top pods -n collector-shop

k8s-top-nodes: ## Affiche les métriques CPU/RAM des nodes
	@echo "$(BLUE)📊 Métriques des nodes$(NC)"
	@kubectl top nodes

k8s-info: ## Affiche les informations du cluster Minikube
	@echo "$(BLUE)ℹ️  Informations Minikube$(NC)"
	@echo ""
	@echo "$(YELLOW)Minikube:$(NC)"
	@minikube version
	@echo ""
	@echo "$(YELLOW)kubectl:$(NC)"
	@kubectl version --client
	@echo ""
	@echo "$(YELLOW)Cluster:$(NC)"
	@minikube status
	@echo ""
	@echo "$(YELLOW)IP Minikube:$(NC)"
	@minikube ip

##@ ArgoCD (GitOps CD)

argocd-install: ## Installe ArgoCD sur Minikube (namespace argocd)
	@echo "$(BLUE)🚀 Installation d'ArgoCD sur Minikube...$(NC)"
	@kubectl apply -f k8s/argocd/namespace.yaml
	@kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
	@echo "$(YELLOW)⏳ Attente du démarrage d'ArgoCD (~2 min)...$(NC)"
	@kubectl wait --for=condition=available --timeout=180s deployment/argocd-server -n argocd
	@echo "$(BLUE)Exposition du serveur ArgoCD en NodePort 30080...$(NC)"
	@kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort", "ports": [{"port": 443, "targetPort": 8080, "nodePort": 30080, "protocol": "TCP"}]}}'
	@echo "$(BLUE)Application du projet ArgoCD...$(NC)"
	@kubectl apply -f k8s/argocd/project.yaml
	@kubectl apply -f k8s/argocd/application.yaml
	@kubectl apply -f k8s/argocd/jenkins-serviceaccount.yaml
	@echo ""
	@echo "$(GREEN)✅ ArgoCD installé$(NC)"
	@echo "$(YELLOW)🌐 Interface : http://$(shell minikube ip):30080$(NC)"
	@echo "$(YELLOW)🔑 Mot de passe admin : make argocd-password$(NC)"

argocd-password: ## Affiche le mot de passe initial du compte admin ArgoCD
	@echo "$(BLUE)🔑 Mot de passe ArgoCD admin :$(NC)"
	@kubectl -n argocd get secret argocd-initial-admin-secret \
		-o jsonpath="{.data.password}" | base64 -d && echo

argocd-open: ## Ouvre l'interface ArgoCD dans le navigateur
	@echo "$(BLUE)🌐 Ouverture d'ArgoCD...$(NC)"
	@xdg-open "http://$(shell minikube ip):30080" 2>/dev/null \
		|| open "http://$(shell minikube ip):30080" 2>/dev/null \
		|| echo "$(YELLOW)Ouvrez http://$(shell minikube ip):30080$(NC)"

argocd-status: ## Affiche le statut de l'application ArgoCD
	@echo "$(BLUE)📊 Statut ArgoCD — collector-shop$(NC)"
	@kubectl get applications -n argocd
	@echo ""
	@kubectl get pods -n argocd

argocd-sync: ## Déclenche manuellement une synchronisation ArgoCD
	@echo "$(BLUE)🔄 Synchronisation ArgoCD...$(NC)"
	@argocd app sync collector-shop --insecure --grpc-web \
		--server "$(shell minikube ip):30080" 2>/dev/null \
		|| kubectl patch application collector-shop -n argocd \
			--type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}' \
		|| echo "$(YELLOW)Utilisez l'interface web : http://$(shell minikube ip):30080$(NC)"

argocd-history: ## Affiche l'historique des déploiements ArgoCD
	@echo "$(BLUE)📋 Historique des déploiements$(NC)"
	@argocd app history collector-shop --insecure \
		--server "$(shell minikube ip):30080" 2>/dev/null \
		|| kubectl describe application collector-shop -n argocd | grep -A20 "Operation State"

argocd-rollback: ## Rollback ArgoCD vers la version précédente (usage: make argocd-rollback REV=1)
	@echo "$(RED)⏪ Rollback ArgoCD vers la révision $(REV)...$(NC)"
	@argocd app rollback collector-shop $(REV) --insecure \
		--server "$(shell minikube ip):30080" 2>/dev/null \
		|| echo "$(YELLOW)Spécifiez REV : make argocd-rollback REV=<numéro>$(NC)"

argocd-clean: ## Supprime ArgoCD du cluster (⚠️ IRRÉVERSIBLE)
	@echo "$(RED)⚠️  Suppression d'ArgoCD...$(NC)"
	@kubectl delete -f k8s/argocd/application.yaml 2>/dev/null || true
	@kubectl delete -f k8s/argocd/project.yaml 2>/dev/null || true
	@kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml 2>/dev/null || true
	@kubectl delete namespace argocd 2>/dev/null || true
	@echo "$(GREEN)✅ ArgoCD supprimé$(NC)"

##@ Netdata (Monitoring — 100% local, sans API key)

netdata-install: ## Déploie Netdata sur Minikube (Parent + DaemonSet children)
	@echo "$(BLUE)📊 Déploiement Netdata...$(NC)"
	@kubectl apply -k k8s/monitoring/netdata/
	@echo "$(YELLOW)⏳ Attente du démarrage du parent Netdata...$(NC)"
	@kubectl wait --for=condition=available --timeout=120s deployment/netdata-parent -n monitoring
	@kubectl wait --for=condition=ready pod -l app=netdata,role=child -n monitoring --timeout=120s || true
	@echo ""
	@echo "$(GREEN)✅ Netdata déployé$(NC)"
	@echo "$(YELLOW)📊 Dashboard : http://$(shell minikube ip):30199$(NC)"
	@echo "$(YELLOW)  → Métriques : CPU, mémoire, réseau, conteneurs, Kubernetes$(NC)"
	@echo "$(YELLOW)  → Intégrations auto : PostgreSQL, Redis$(NC)"

netdata-open: ## Ouvre le dashboard Netdata dans le navigateur
	@echo "$(BLUE)🌐 Ouverture de Netdata...$(NC)"
	@xdg-open "http://$(shell minikube ip):30199" 2>/dev/null \
		|| open "http://$(shell minikube ip):30199" 2>/dev/null \
		|| echo "$(YELLOW)Ouvrez http://$(shell minikube ip):30199$(NC)"

netdata-status: ## Affiche le statut des pods Netdata
	@echo "$(BLUE)📊 Statut Netdata$(NC)"
	@echo ""
	@echo "$(YELLOW)Parent :$(NC)"
	@kubectl get pods -n monitoring -l app=netdata,role=parent -o wide
	@echo ""
	@echo "$(YELLOW)Children (DaemonSet) :$(NC)"
	@kubectl get pods -n monitoring -l app=netdata,role=child -o wide
	@echo ""
	@echo "$(YELLOW)Services :$(NC)"
	@kubectl get svc -n monitoring -l app=netdata

netdata-logs: ## Affiche les logs Netdata en temps réel (parent)
	@echo "$(BLUE)📋 Logs Netdata Parent$(NC)"
	@kubectl logs -n monitoring -l app=netdata,role=parent --tail=100 -f

netdata-clean: ## Supprime Netdata du cluster (⚠️ IRRÉVERSIBLE)
	@echo "$(RED)⚠️  Suppression de Netdata...$(NC)"
	@kubectl delete -k k8s/monitoring/netdata/ 2>/dev/null || true
	@echo "$(GREEN)✅ Netdata supprimé$(NC)"

##@ Infrastructure complète (Minikube + ArgoCD + Netdata)

infra-up: ## Lance toute l'infrastructure (Minikube + ArgoCD + Netdata + App)
	@echo "$(BLUE)🚀 Démarrage de l'infrastructure complète...$(NC)"
	@echo ""
	@echo "$(YELLOW)1/4 — Démarrage Minikube$(NC)"
	@minikube start --memory=6144 --cpus=4 --disk-size=40g --addons=metrics-server,ingress
	@echo ""
	@echo "$(YELLOW)2/4 — Build des images dans Minikube$(NC)"
	@eval $$(minikube docker-env) \
		&& docker build -t collector-shop-backend:latest -f backend/Dockerfile backend/ \
		&& docker build -t collector-shop-frontend:latest -f frontend/Dockerfile .
	@echo ""
	@echo "$(YELLOW)3/4 — Déploiement de l'application via Kustomize$(NC)"
	@kubectl apply -k k8s/overlays/minikube/
	@echo ""
	@echo "$(YELLOW)4/4 — Installation ArgoCD$(NC)"
	@$(MAKE) argocd-install
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)  ✅  Infrastructure prête                              ║$(NC)"
	@echo "$(GREEN)════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)📊 ArgoCD    : http://$(shell minikube ip):30080$(NC)"
	@echo "$(YELLOW)🌐 Backend   : http://$(shell minikube ip):31000$(NC)"
	@echo "$(YELLOW)🌐 Frontend  : http://$(shell minikube ip):31001$(NC)"
	@echo "$(YELLOW)📈 Grafana   : http://$(shell minikube ip):31300$(NC)"
	@echo ""
	@echo "$(YELLOW)🔑 ArgoCD admin password : make argocd-password$(NC)"
	@echo "$(YELLOW)📊 Netdata               : make netdata-install  (pas de clé API requise)$(NC)"

infra-down: ## Arrête et nettoie toute l'infrastructure
	@echo "$(RED)⚠️  Arrêt de l'infrastructure...$(NC)"
	@$(MAKE) argocd-clean
	@$(MAKE) netdata-clean
	@kubectl delete -k k8s/overlays/minikube/ 2>/dev/null || true
	@minikube stop
	@echo "$(GREEN)✅ Infrastructure arrêtée$(NC)"

infra-status: ## Affiche le statut complet de l'infrastructure
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)  STATUT INFRASTRUCTURE — COLLECTOR.SHOP               $(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)🔷 Minikube :$(NC)"
	@minikube status 2>/dev/null || echo "  Arrêté"
	@echo ""
	@echo "$(YELLOW)🐳 Pods collector-shop :$(NC)"
	@kubectl get pods -n collector-shop -o wide 2>/dev/null || echo "  Namespace non disponible"
	@echo ""
	@echo "$(YELLOW)📦 ArgoCD :$(NC)"
	@kubectl get applications -n argocd 2>/dev/null || echo "  ArgoCD non installé"
	@echo ""
	@echo "$(YELLOW)📊 Netdata :$(NC)"
	@kubectl get pods -n monitoring -l app=netdata 2>/dev/null || echo "  Non installé"
	@echo "$(YELLOW)  Dashboard : http://$(shell minikube ip 2>/dev/null || echo '192.168.49.2'):30199$(NC)"
	@echo ""
	@echo "$(YELLOW)📈 HPA :$(NC)"
	@kubectl get hpa -n collector-shop 2>/dev/null || echo "  Pas de HPA"
	@echo ""
	@echo "$(YELLOW)🌐 URLs :$(NC)"
	@echo "  ArgoCD   : http://$(shell minikube ip 2>/dev/null || echo '192.168.49.2'):30080"
	@echo "  Backend  : http://$(shell minikube ip 2>/dev/null || echo '192.168.49.2'):31000"
	@echo "  Frontend : http://$(shell minikube ip 2>/dev/null || echo '192.168.49.2'):31001"
	@echo "  Grafana  : http://$(shell minikube ip 2>/dev/null || echo '192.168.49.2'):31300"

# Commande par défaut
.DEFAULT_GOAL := help
