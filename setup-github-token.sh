#!/bin/bash

# Script pour configurer un Personal Access Token GitHub
# Usage: ./setup-github-token.sh <VOTRE_TOKEN>

if [ -z "$1" ]; then
    echo "Usage: ./setup-github-token.sh <VOTRE_TOKEN>"
    echo ""
    echo "Pour créer un token:"
    echo "1. Allez sur https://github.com/settings/tokens"
    echo "2. Cliquez sur 'Generate new token (classic)'"
    echo "3. Donnez un nom: 'CollectorShop Workflow'"
    echo "4. Cocher les scopes: 'repo' et 'workflow'"
    echo "5. Cliquez sur 'Generate token'"
    echo "6. Copiez le token et utilisez-le avec ce script"
    exit 1
fi

TOKEN=$1
REPO_URL="https://${TOKEN}@github.com/Ismail-Mouyahada/CollectorShop.git"

echo "Configuration du remote Git avec le token..."
git remote set-url origin "$REPO_URL"

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "Vous pouvez maintenant pousser le workflow:"
echo "  git push origin develop"
echo ""
echo "Ou pour la branche main:"
echo "  git push origin main"
