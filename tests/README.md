# Tests - Collector.shop POC

Ce dossier contient tous les tests du projet organisés par type.

## Structure

```
tests/
├── README.md              # Ce fichier
└── load-tests/           # Tests de charge et de performance
    ├── artillery.yml     # Configuration Artillery
    └── load-test.ts      # Fonctions TypeScript personnalisées
```

## Tests de charge (Load Tests)

Les tests de charge sont situés dans le dossier `load-tests/` et utilisent **Artillery** avec **TypeScript**.

### Exécution

```bash
# Depuis la racine du projet
npm run load-test

# Générer un rapport HTML
npm run load-test:report
```

### Fichiers

- **`artillery.yml`** : Configuration YAML des scénarios de test de charge
- **`load-test.ts`** : Fonctions TypeScript personnalisées pour les scénarios complexes

### Documentation

Voir la section [7.5 Environnement managé et tests de montée en charge](../../README.md#75-environnement-managé-et-tests-de-montée-en-charge) dans le README principal pour plus de détails.

## Tests unitaires et d'intégration

Les tests unitaires et d'intégration sont situés dans les workspaces respectifs :

- **Backend** : `backend/src/__tests__/`
- **Frontend** : `frontend/src/__tests__/`

Voir les README des workspaces pour plus d'informations.
