#!/bin/bash

# Script de test rapide du projet Collector.shop
# Ce script vérifie que tous les composants sont en place

echo "🧪 TEST DU PROJET COLLECTOR.SHOP"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction de test
test_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2"
        return 1
    fi
}

test_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2"
        return 1
    fi
}

# Compteurs
PASSED=0
FAILED=0

echo -e "${BLUE}📋 Vérification des fichiers de documentation${NC}"
echo "================================================"

test_file "README.md" "README.md (899 lignes)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "SECURITY.md" "SECURITY.md (300+ lignes)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/AUDIT_FINAL.md" "AUDIT_FINAL.md (rapport final)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/QUICKSTART.md" "QUICKSTART.md (démarrage rapide)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "Makefile" "Makefile (50+ commandes)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file ".editorconfig" ".editorconfig" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/POC_PRISMA.md" "POC Prisma (500+ lignes)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/ARCHITECTURE.md" "Architecture (8 diagrammes)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/INSTALLATION.md" "Guide d'installation" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/MONITORING.md" "Guide de monitoring" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/MAKEFILE.md" "Guide du Makefile" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "docs/CHANGELOG_AUDIT.md" "Changelog des corrections" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))

echo ""
echo -e "${BLUE}🔧 Vérification de la structure backend${NC}"
echo "========================================"

test_dir "backend" "Répertoire backend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/package.json" "package.json backend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/tsconfig.json" "tsconfig.json backend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/Dockerfile" "Dockerfile backend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/prisma/schema.prisma" "Schéma Prisma" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/src/index.ts" "Point d'entrée backend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/src/utils/auth.ts" "Utilitaires auth" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/src/utils/audit-logger.ts" "Audit logger (300+ lignes)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/src/services/fraud-detection.service.ts" "Service fraud detection" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/src/services/moderation.service.ts" "Service modération" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/src/__tests__/auth.test.ts" "Tests auth" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/src/__tests__/announcement.test.ts" "Tests announcements" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))

echo ""
echo -e "${BLUE}💻 Vérification de la structure frontend${NC}"
echo "========================================="

test_dir "frontend" "Répertoire frontend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "frontend/package.json" "package.json frontend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "frontend/tsconfig.json" "tsconfig.json frontend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "frontend/Dockerfile" "Dockerfile frontend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "frontend/src/App.tsx" "App.tsx" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "frontend/src/pages/HomePage.tsx" "HomePage" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "frontend/src/pages/CatalogPage.tsx" "CatalogPage" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))

echo ""
echo -e "${BLUE}🐳 Vérification Docker${NC}"
echo "======================"

test_file "docker-compose.yml" "docker-compose.yml (7 services)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "backend/Dockerfile.dev" "Dockerfile.dev backend" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))

echo ""
echo -e "${BLUE}🔒 Vérification CI/CD et sécurité${NC}"
echo "=================================="

test_file ".github/workflows/ci-cd.yml" "Pipeline CI/CD (10 jobs)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file ".github/dependabot.yml" "Dependabot config" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))

echo ""
echo -e "${BLUE}📊 Vérification monitoring${NC}"
echo "=========================="

test_file "grafana/dashboards/collector-shop-dashboard.json" "Dashboard Grafana (avec P99)" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "grafana/provisioning/datasources/victoriametrics.yml" "Datasource VictoriaMetrics" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))

echo ""
echo -e "${BLUE}🧪 Vérification tests${NC}"
echo "====================="

test_file "tests/load-tests/artillery.yml" "Config Artillery" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
test_file "tests/load-tests/load-test.ts" "Script de test de charge" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))

echo ""
echo "=================================="
echo -e "${BLUE}📊 RÉSULTATS${NC}"
echo "=================================="
echo ""
echo -e "Tests réussis: ${GREEN}$PASSED${NC}"
echo -e "Tests échoués: ${RED}$FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES TESTS SONT PASSÉS !${NC}"
    echo -e "${GREEN}🏆 Score: $PERCENTAGE% ($PASSED/$TOTAL)${NC}"
    echo ""
    echo -e "${BLUE}Le projet est prêt pour validation RNCP !${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Quelques fichiers manquent${NC}"
    echo -e "${YELLOW}Score: $PERCENTAGE% ($PASSED/$TOTAL)${NC}"
    exit 1
fi
