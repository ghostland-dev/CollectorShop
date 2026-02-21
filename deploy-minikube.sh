#!/bin/bash

# Script de déploiement Minikube pour Collector.shop
# Usage: ./deploy-minikube.sh [start|stop|restart|status|logs|clean]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="collector-shop"
MINIKUBE_MEMORY="8192"
MINIKUBE_CPUS="4"
MINIKUBE_DISK="40g"

# Fonctions
print_header() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}                                                           ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}        🚀 Collector.shop - Déploiement Minikube         ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                           ${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_prerequisites() {
    echo -e "${YELLOW}🔍 Vérification des prérequis...${NC}"
    
    if ! command -v minikube &> /dev/null; then
        echo -e "${RED}❌ Minikube n'est pas installé${NC}"
        echo "Installation: https://minikube.sigs.k8s.io/docs/start/"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl n'est pas installé${NC}"
        echo "Installation: https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé${NC}"
        echo "Installation: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Tous les prérequis sont installés${NC}"
    echo ""
}

start_minikube() {
    echo -e "${YELLOW}🚀 Démarrage de Minikube...${NC}"
    
    if minikube status | grep -q "Running"; then
        echo -e "${GREEN}✅ Minikube est déjà en cours d'exécution${NC}"
    else
        minikube start \
            --memory=$MINIKUBE_MEMORY \
            --cpus=$MINIKUBE_CPUS \
            --disk-size=$MINIKUBE_DISK \
            --driver=docker
        
        echo -e "${GREEN}✅ Minikube démarré${NC}"
    fi
    
    # Activer les addons
    echo -e "${YELLOW}🔧 Activation des addons...${NC}"
    minikube addons enable ingress
    minikube addons enable metrics-server
    echo -e "${GREEN}✅ Addons activés${NC}"
    echo ""
}

build_images() {
    echo -e "${YELLOW}🏗️  Build des images Docker...${NC}"
    
    # Utiliser le daemon Docker de Minikube
    eval $(minikube docker-env)
    
    # Build backend
    echo -e "${BLUE}📦 Build backend...${NC}"
    docker build -t collector-shop-backend:latest -f backend/Dockerfile backend/
    
    # Build frontend
    echo -e "${BLUE}📦 Build frontend...${NC}"
    docker build -t collector-shop-frontend:latest -f frontend/Dockerfile .
    
    echo -e "${GREEN}✅ Images construites${NC}"
    echo ""
}

deploy_infrastructure() {
    echo -e "${YELLOW}🏗️  Déploiement de l'infrastructure...${NC}"
    
    # Créer le namespace
    kubectl apply -f k8s/base/namespace.yaml
    
    # Déployer les services d'infrastructure
    kubectl apply -f k8s/base/postgres-pv.yaml
    kubectl apply -f k8s/base/postgres.yaml
    kubectl apply -f k8s/base/redis.yaml
    kubectl apply -f k8s/base/minio.yaml
    kubectl apply -f k8s/base/victoriametrics.yaml
    kubectl apply -f k8s/base/grafana.yaml
    
    # Déployer Loki et Promtail pour les logs
    echo -e "${BLUE}📋 Déploiement de Loki...${NC}"
    kubectl apply -f k8s/base/loki.yaml
    kubectl apply -f k8s/base/promtail.yaml
    
    echo -e "${GREEN}✅ Infrastructure déployée${NC}"
    echo ""
}

wait_for_infrastructure() {
    echo -e "${YELLOW}⏳ Attente de la disponibilité de l'infrastructure...${NC}"
    
    echo -e "${BLUE}   Attente de PostgreSQL...${NC}"
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    
    echo -e "${BLUE}   Attente de Redis...${NC}"
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    
    echo -e "${BLUE}   Attente de MinIO...${NC}"
    kubectl wait --for=condition=ready pod -l app=minio -n $NAMESPACE --timeout=300s
    
    echo -e "${BLUE}   Attente de VictoriaMetrics...${NC}"
    kubectl wait --for=condition=ready pod -l app=victoriametrics -n $NAMESPACE --timeout=300s
    
    echo -e "${BLUE}   Attente de Loki...${NC}"
    kubectl wait --for=condition=ready pod -l app=loki -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✅ Infrastructure prête${NC}"
    echo ""
}

run_migrations() {
    echo -e "${YELLOW}🔄 Exécution des migrations...${NC}"
    
    # Attendre que le backend soit prêt
    kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s || true
    
    # Récupérer le premier pod backend
    BACKEND_POD=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$BACKEND_POD" ]; then
        echo -e "${BLUE}   Migration Prisma...${NC}"
        kubectl exec -n $NAMESPACE $BACKEND_POD -- npx prisma migrate deploy
        
        echo -e "${BLUE}   Seed de la base de données...${NC}"
        kubectl exec -n $NAMESPACE $BACKEND_POD -- npm run prisma:seed || true
        
        echo -e "${GREEN}✅ Migrations terminées${NC}"
    else
        echo -e "${YELLOW}⚠️  Aucun pod backend trouvé, migrations sautées${NC}"
    fi
    echo ""
}

deploy_application() {
    echo -e "${YELLOW}🚀 Déploiement de l'application...${NC}"
    
    kubectl apply -f k8s/base/backend.yaml
    kubectl apply -f k8s/base/frontend.yaml
    
    echo -e "${GREEN}✅ Application déployée${NC}"
    echo ""
}

show_status() {
    echo -e "${YELLOW}📊 Statut du déploiement${NC}"
    echo ""
    
    echo -e "${BLUE}Pods:${NC}"
    kubectl get pods -n $NAMESPACE
    echo ""
    
    echo -e "${BLUE}Services:${NC}"
    kubectl get services -n $NAMESPACE
    echo ""
    
    echo -e "${BLUE}Deployments:${NC}"
    kubectl get deployments -n $NAMESPACE
    echo ""
}

show_urls() {
    echo -e "${YELLOW}🔗 URLs d'accès${NC}"
    echo ""
    
    MINIKUBE_IP=$(minikube ip)
    
    echo -e "${GREEN}Frontend:${NC}         http://$MINIKUBE_IP:30080"
    echo -e "${GREEN}Backend API:${NC}      http://$MINIKUBE_IP:30000"
    echo -e "${GREEN}Backend Health:${NC}   http://$MINIKUBE_IP:30000/health"
    echo -e "${GREEN}Backend Metrics:${NC}  http://$MINIKUBE_IP:30000/metrics"
    echo -e "${GREEN}Grafana:${NC}          http://$MINIKUBE_IP:30001 (admin / admin123)"
    echo ""
    
    echo -e "${BLUE}💡 Astuce: Utilisez 'minikube service list' pour voir tous les services${NC}"
    echo ""
}

show_logs() {
    SERVICE=$1
    
    if [ -z "$SERVICE" ]; then
        echo -e "${YELLOW}Services disponibles:${NC}"
        echo "  - backend"
        echo "  - frontend"
        echo "  - postgres"
        echo "  - redis"
        echo "  - minio"
        echo "  - victoriametrics"
        echo "  - grafana"
        echo ""
        echo "Usage: $0 logs <service>"
        return
    fi
    
    echo -e "${YELLOW}📋 Logs de $SERVICE${NC}"
    kubectl logs -n $NAMESPACE -l app=$SERVICE --tail=100 -f
}

stop_minikube() {
    echo -e "${YELLOW}🛑 Arrêt de Minikube...${NC}"
    minikube stop
    echo -e "${GREEN}✅ Minikube arrêté${NC}"
}

clean_deployment() {
    echo -e "${YELLOW}🧹 Nettoyage du déploiement...${NC}"
    
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    echo -e "${GREEN}✅ Déploiement nettoyé${NC}"
    echo ""
    
    read -p "Voulez-vous supprimer le cluster Minikube? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        minikube delete
        echo -e "${GREEN}✅ Cluster Minikube supprimé${NC}"
    fi
}

restart_deployment() {
    echo -e "${YELLOW}🔄 Redémarrage du déploiement...${NC}"
    
    kubectl rollout restart deployment -n $NAMESPACE
    
    echo -e "${GREEN}✅ Redémarrage en cours${NC}"
    echo ""
    
    show_status
}

# Menu principal
case "${1:-}" in
    start)
        print_header
        check_prerequisites
        start_minikube
        build_images
        deploy_infrastructure
        wait_for_infrastructure
        deploy_application
        run_migrations
        echo ""
        show_status
        show_urls
        echo -e "${GREEN}🎉 Déploiement terminé avec succès!${NC}"
        ;;
    
    stop)
        print_header
        stop_minikube
        ;;
    
    restart)
        print_header
        restart_deployment
        ;;
    
    status)
        print_header
        show_status
        show_urls
        ;;
    
    logs)
        show_logs $2
        ;;
    
    clean)
        print_header
        clean_deployment
        ;;
    
    urls)
        print_header
        show_urls
        ;;
    
    *)
        print_header
        echo -e "${YELLOW}Usage:${NC} $0 {start|stop|restart|status|logs|urls|clean}"
        echo ""
        echo -e "${BLUE}Commandes disponibles:${NC}"
        echo "  start      - Démarre Minikube et déploie l'application"
        echo "  stop       - Arrête Minikube"
        echo "  restart    - Redémarre tous les déploiements"
        echo "  status     - Affiche le statut du déploiement"
        echo "  logs       - Affiche les logs d'un service"
        echo "  urls       - Affiche les URLs d'accès"
        echo "  clean      - Nettoie le déploiement et optionnellement le cluster"
        echo ""
        exit 1
        ;;
esac
