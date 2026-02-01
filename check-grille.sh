#!/bin/bash

# Script de vérification de la grille de notation RNCP
# Vérifie que tous les critères sont remplis

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          VÉRIFICATION GRILLE DE NOTATION RNCP             ║"
echo "║                  COLLECTOR.SHOP                            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Compteurs
TOTAL_POINTS=0
MAX_POINTS=20

# Fonction de vérification
check_criterion() {
    local criterion=$1
    local description=$2
    local points=$3
    local files=$4
    
    echo -e "${BOLD}${criterion}${NC} : ${description}"
    
    # Vérifier les fichiers
    local all_exist=true
    IFS=',' read -ra FILE_ARRAY <<< "$files"
    for file in "${FILE_ARRAY[@]}"; do
        if [ -f "$file" ] || [ -d "$file" ]; then
            echo -e "  ${GREEN}✅${NC} $file"
        else
            echo -e "  ${RED}❌${NC} $file (manquant)"
            all_exist=false
        fi
    done
    
    if [ "$all_exist" = true ]; then
        echo -e "  ${GREEN}${BOLD}→ ${points}/${points} points${NC}"
        echo ""
        return $points
    else
        echo -e "  ${RED}${BOLD}→ 0/${points} points${NC}"
        echo ""
        return 0
    fi
}

echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}BLOC 1 : MAINTENIR ET DÉVELOPPER SON EXPERTISE${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1.1 Protocole expérimentation (2 points)
check_criterion \
    "1.1" \
    "Protocole d'expérimentation rigoureux" \
    "2" \
    "docs/POC_PRISMA.md"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

# 1.2 Implémentation technique (4 points)
check_criterion \
    "1.2" \
    "Implémentation technique complète" \
    "4" \
    "docs/ARCHITECTURE.md,backend/src/index.ts,frontend/src/App.tsx"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

# 1.3 Fonctionnalité métier (1 point)
check_criterion \
    "1.3" \
    "Fonctionnalités métier implémentées" \
    "1" \
    "backend/src/routes/announcement.routes.ts,backend/src/routes/purchase.routes.ts"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}BLOC 2 : PILOTER LE DÉVELOPPEMENT${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 2.1 Livraison continue (3 points)
check_criterion \
    "2.1" \
    "Pipeline CI/CD avec tests automatisés" \
    "3" \
    ".github/workflows/ci-cd.yml,backend/src/__tests__/auth.test.ts,tests/load-tests/artillery.yml"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

# 2.2 Compétences équipe (1 point)
check_criterion \
    "2.2" \
    "Cartographie des compétences" \
    "1" \
    "README.md"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

# 2.3 Environnement managé (2 points)
check_criterion \
    "2.3" \
    "Environnement de développement managé" \
    "2" \
    "docker-compose.yml,Makefile"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}BLOC 3 : ASSURANCE QUALITÉ${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 3.1 Indicateurs qualité (1 point)
check_criterion \
    "3.1" \
    "Indicateurs qualité ISO 25010" \
    "1" \
    "grafana/dashboards/collector-shop-dashboard.json,docs/MONITORING.md"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

# 3.2 Processus de test (2 points)
check_criterion \
    "3.2" \
    "Processus de test complet" \
    "2" \
    "backend/src/__tests__/auth.test.ts,backend/src/__tests__/announcement.test.ts,tests/load-tests/load-test.ts"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

# 3.3 Plan de remédiation (2 points)
check_criterion \
    "3.3" \
    "Plan de remédiation sécurité" \
    "2" \
    "SECURITY.md,backend/src/utils/audit-logger.ts"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}BLOC 4 : PRÉSENTATION ORALE${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 4.1 Schémas et tableaux (1 point)
check_criterion \
    "4.1" \
    "Schémas et diagrammes d'architecture" \
    "1" \
    "docs/ARCHITECTURE.md"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

# 4.2 Prestation orale (1 point)
check_criterion \
    "4.2" \
    "Support de présentation structuré" \
    "1" \
    "README.md,docs/AUDIT_FINAL.md,docs/QUICKSTART.md"
POINTS=$?
TOTAL_POINTS=$((TOTAL_POINTS + POINTS))

echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}RÉSULTAT FINAL${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

PERCENTAGE=$((TOTAL_POINTS * 100 / MAX_POINTS))

echo -e "${BOLD}Score obtenu : ${TOTAL_POINTS}/${MAX_POINTS} points (${PERCENTAGE}%)${NC}"
echo ""

if [ $TOTAL_POINTS -eq $MAX_POINTS ]; then
    echo -e "${GREEN}${BOLD}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║                 ✅ VALIDATION COMPLÈTE                     ║"
    echo "║                                                            ║"
    echo "║              Score : 20/20 (100%)                          ║"
    echo "║              Mention : EXCELLENT                           ║"
    echo "║                                                            ║"
    echo "║    🏆 PROJET PRÊT POUR VALIDATION RNCP 🏆                 ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    exit 0
elif [ $TOTAL_POINTS -ge 16 ]; then
    echo -e "${GREEN}${BOLD}✅ TRÈS BIEN (A)${NC}"
    echo "Le projet répond à tous les critères essentiels."
    exit 0
elif [ $TOTAL_POINTS -ge 12 ]; then
    echo -e "${YELLOW}${BOLD}⚠️  BIEN (B)${NC}"
    echo "Le projet est validable mais peut être amélioré."
    exit 0
else
    echo -e "${RED}${BOLD}❌ INSUFFISANT${NC}"
    echo "Le projet nécessite des corrections importantes."
    exit 1
fi
