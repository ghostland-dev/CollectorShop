#!/bin/bash

echo "🔍 Diagnostic de l'API Collector.shop"
echo "======================================"
echo ""

# Vérifier si le backend répond
echo "1. Vérification du health check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
  echo "Backend accessible (HTTP $HEALTH_RESPONSE)"
  curl -s http://localhost:5000/health | jq . 2>/dev/null || curl -s http://localhost:5000/health
else
  echo "Backend non accessible (HTTP $HEALTH_RESPONSE)"
  echo "Vérifiez que le backend est démarré: cd backend && npm run dev"
fi
echo ""

# Vérifier l'endpoint des annonces
echo "2. Vérification de l'endpoint /api/announcements..."
ANNOUNCEMENTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/announcements 2>/dev/null)
if [ "$ANNOUNCEMENTS_RESPONSE" = "200" ]; then
  echo "Endpoint accessible (HTTP $ANNOUNCEMENTS_RESPONSE)"
  echo "Structure de la réponse:"
  curl -s http://localhost:5000/api/announcements | jq 'keys' 2>/dev/null || echo "   (jq non installé, réponse brute ci-dessous)"
  curl -s http://localhost:5000/api/announcements | head -20
else
  echo "Endpoint non accessible (HTTP $ANNOUNCEMENTS_RESPONSE)"
fi
echo ""

# Vérifier la base de données
echo "3. Vérification de la base de données..."
if command -v psql &> /dev/null; then
  DB_COUNT=$(psql -h localhost -U collector -d collector_shop -t -c "SELECT COUNT(*) FROM \"Announcement\";" 2>/dev/null || echo "0")
  if [ "$DB_COUNT" != "0" ]; then
    echo "Base de données accessible"
    echo "Nombre d'annonces: $DB_COUNT"
  else
    echo "Base de données accessible mais aucune annonce trouvée"
    echo "Exécutez: cd backend && npm run prisma:seed"
  fi
else
  echo "   ⚠️  psql non disponible, impossible de vérifier directement"
fi
echo ""

# Vérifier les variables d'environnement
echo "4. Variables d'environnement frontend..."
echo "   VITE_API_URL: ${VITE_API_URL:-'non définie (utilise http://localhost:5000/api)'}"
echo ""

echo "Diagnostic terminé"
