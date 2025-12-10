# Configuration d'un Personal Access Token pour GitHub

## Problème

GitHub refuse de pousser le workflow car votre authentification actuelle n'a pas le scope `workflow`.

## Solution : Créer un Personal Access Token (PAT)

### Étape 1 : Créer le token

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donnez un nom : `CollectorShop Workflow`
4. Sélectionnez les scopes :
   - ✅ **repo** (accès complet au repository)
   - ✅ **workflow** (mise à jour des workflows GitHub Actions)
5. Cliquez sur **"Generate token"** en bas de la page
6. **IMPORTANT** : Copiez le token immédiatement (vous ne pourrez plus le voir après)

### Étape 2 : Configurer Git avec le token

Remplacez `<VOTRE_TOKEN>` par le token que vous avez copié :

```bash
git remote set-url origin https://<VOTRE_TOKEN>@github.com/Ismail-Mouyahada/CollectorShop.git
```

Ou avec votre username :

```bash
git remote set-url origin https://Ismail-Mouyahada:<VOTRE_TOKEN>@github.com/Ismail-Mouyahada/CollectorShop.git
```

### Étape 3 : Pousser le workflow

```bash
git push origin develop
```

## Alternative : Pousser sans le workflow d'abord

Si vous voulez pousser le reste du code maintenant et ajouter le workflow plus tard :

```bash
# Retirer temporairement le workflow du commit
git reset HEAD~1
git add .github/workflows/ci-cd.yml
git stash

# Pousser le reste
git add .
git commit -m "feat: ajouter les fonctionnalités principales"
git push origin develop

# Plus tard, avec un PAT configuré
git stash pop
git add .github/workflows/ci-cd.yml
git commit -m "ci: ajouter le pipeline CI/CD"
git push origin develop
```

## Vérification

Après avoir poussé avec le PAT, vérifiez que le workflow apparaît :
- Allez sur https://github.com/Ismail-Mouyahada/CollectorShop
- Onglet **Actions**
- Le workflow "CI/CD Pipeline" devrait être visible
