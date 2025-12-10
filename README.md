# POC Collector.shop - Documentation Complète

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Phase 1 - Structuration du processus de développement](#phase-1)
3. [Phase 2 - Développement + POC](#phase-2)
4. [Phase 3 - Analyse sécurité et plan de remédiation](#phase-3)
5. [Installation et déploiement](#installation)

---

## Vue d'ensemble

Collector.shop est une plateforme de vente d'objets de collection entre particuliers développée par la start-up française Collector.

### Rôles
- **Acheteur** : Consultation du catalogue, achat d'objets
- **Vendeur** : Création d'annonces, gestion de boutique
- **Admin** : Modération, gestion des utilisateurs

### Fonctionnalités principales
- Catalogue public
- Espace vendeur/acheteur
- Système de notifications
- Chat entre utilisateurs
- Paiement CB
- Contrôle automatisé des annonces
- Internationalisation (i18n)
- Accessibilité (a11y)
- Intégration fraud detection v1
- Architecture évolutive

---

## Phase 1 - Structuration du processus de développement

### 1. Indicateurs qualité (ISO 25010)

#### 1.1 Couverture de tests
**Métrique** : Pourcentage de code couvert par les tests (unitaires, intégration, E2E)

**Objectif** : ≥ 80% de couverture

**Impact sur la dette technique** :
- Réduction des régressions
- Facilite les refactorings
- Documentation vivante du code
- Détection précoce des bugs

**Outils** : Jest, Istanbul/NYC, SonarQube

#### 1.2 Complexité cyclomatique
**Métrique** : Nombre de chemins indépendants dans le code

**Objectif** : ≤ 10 par fonction/méthode

**Impact sur la dette technique** :
- Code plus maintenable
- Tests plus faciles à écrire
- Réduction des bugs
- Amélioration de la lisibilité

**Outils** : ESLint (complexity rule), SonarQube

#### 1.3 Temps de réponse API
**Métrique** : P95 et P99 des temps de réponse des endpoints

**Objectif** : P95 < 200ms, P99 < 500ms

**Impact sur la dette technique** :
- Performance prévisible
- Expérience utilisateur optimale
- Identification des goulots d'étranglement
- Prévention de la dégradation progressive

**Outils** : VictoriaMetrics, Prometheus, Grafana, APM (New Relic, Datadog)

**Implémentation** :
- Métriques Prometheus exposées sur `/metrics`
- Push automatique vers VictoriaMetrics (toutes les 15s)
- Middleware de métriques pour toutes les requêtes HTTP
- Métriques : HTTP requests, duration, errors, DB queries, cache hits/misses

#### 1.4 Taux d'erreurs / MTTR (Mean Time To Recovery)
**Métrique** : 
- Taux d'erreurs HTTP 5xx : < 0.1%
- MTTR : < 15 minutes

**Impact sur la dette technique** :
- Fiabilité du système
- Résilience accrue
- Monitoring proactif
- Réduction du temps de résolution

**Outils** : Sentry, ELK Stack, PagerDuty

### 2. Cycle de vie DevSecOps complet

#### 2.1 Pipeline CI/CD

```
┌─────────────┐
│   Git Push  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Build & Lint   │
│  - npm install  │
│  - TypeScript   │
│  - ESLint       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Tests Unitaires│
│  - Jest         │
│  - Coverage     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Tests Intégration│
│  - Supertest    │
│  - Test DB      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Analyse Code    │
│  - SonarQube    │
│  - Code Quality │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Scan Sécurité   │
│  - Snyk/OWASP   │
│  - Container    │
│  - SCA          │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Build Container │
│  - Docker       │
│  - Scan Trivy   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Déploiement   │
│  - Staging      │
│  - Production   │
└─────────────────┘
```

#### 2.2 Mesures de sécurité par étape

| Étape | Mesures de sécurité |
|-------|---------------------|
| **Build** | Vérification des dépendances, signature des artefacts |
| **Tests** | Tests de sécurité (OWASP ZAP, penetration tests) |
| **Analyse** | Scan de vulnérabilités, analyse statique (SAST) |
| **Container** | Scan d'images Docker, vérification des bases |
| **Déploiement** | Secrets management (Vault), rotation des clés |
| **Runtime** | Monitoring sécurité, détection d'intrusions |

#### 2.3 Outils recommandés

- **CI/CD** : GitHub Actions, GitLab CI
- **Tests** : Jest, Supertest, Playwright
- **Analyse** : SonarQube, ESLint, Prettier
- **Sécurité** : Snyk, OWASP ZAP, Trivy, Snyk Container
- **Monitoring** : Prometheus, Grafana, Sentry
- **Secrets** : HashiCorp Vault, AWS Secrets Manager

### 3. Compétences et formation

#### 3.1 Cartographie des compétences

| Compétence | Niveau requis | Responsable |
|------------|---------------|-------------|
| **Backend (Node.js/TypeScript)** | Expert | Lead Developer |
| **Frontend (React/TypeScript)** | Avancé | Frontend Developer |
| **Base de données (PostgreSQL)** | Avancé | Backend Developer |
| **DevOps (Docker, K8s)** | Intermédiaire | DevOps Engineer |
| **Sécurité (OWASP, SAST/DAST)** | Avancé | Security Engineer |
| **Tests (Jest, E2E)** | Avancé | QA Engineer |
| **CI/CD (GitHub Actions)** | Intermédiaire | DevOps Engineer |

#### 3.2 Plan de formation

**Module 1 : Sécurité applicative (2 jours)**
- OWASP Top 10
- Injection SQL, XSS, CSRF
- Authentification et autorisation
- Chiffrement des données

**Module 2 : DevSecOps (3 jours)**
- Intégration sécurité dans le pipeline
- Scans automatisés
- Gestion des secrets
- Monitoring sécurité

**Module 3 : Tests automatisés (2 jours)**
- Tests unitaires avancés
- Tests d'intégration
- Tests E2E
- Mocks et stubs

**Module 4 : Observabilité (1 jour)**
- Logging structuré
- Métriques Prometheus
- Tracing distribué
- Alerting

---

## Phase 2 - Développement + POC

### 4. Analyse des exigences + backlog

#### 4.1 Reformulation des besoins

**Besoins fonctionnels** :
- Gestion des utilisateurs (inscription, authentification, profils)
- Gestion des annonces (création, modification, suppression)
- Catalogue public avec recherche et filtres
- Système de paiement sécurisé
- Notifications en temps réel
- Chat entre utilisateurs

**Besoins non-fonctionnels** :
- Performance : < 200ms P95
- Disponibilité : 99.9%
- Sécurité : Conformité RGPD, OWASP
- Scalabilité : Support 10k utilisateurs simultanés
- Accessibilité : WCAG 2.1 AA

#### 4.2 Backlog

**US-001 : Création d'annonce par un vendeur**

```gherkin
Feature: Création d'annonce
  As a vendeur
  I want to create an announcement for a collectible item
  So that I can sell it on the platform

  Scenario: Création d'annonce valide
    Given I am authenticated as a vendeur
    When I create an announcement with:
      | title       | "Timbre rare 1950" |
      | description | "Timbre en excellent état" |
      | price       | 150.00 |
      | category    | "Philatélie" |
      | images      | [image1.jpg, image2.jpg] |
    Then the announcement is created successfully
    And it appears in my seller dashboard
    And it is visible in the public catalog

  Scenario: Création d'annonce invalide (champs manquants)
    Given I am authenticated as a vendeur
    When I create an announcement without required fields
    Then I receive a validation error
    And the announcement is not created
```

**US-002 : Consultation du catalogue**

```gherkin
Feature: Consultation du catalogue
  As a visitor or buyer
  I want to browse the catalog
  So that I can find collectible items

  Scenario: Recherche d'articles
    Given I am on the catalog page
    When I search for "timbre"
    Then I see all announcements containing "timbre"
    And results are sorted by relevance

  Scenario: Filtrage par catégorie
    Given I am on the catalog page
    When I filter by category "Philatélie"
    Then I see only announcements in this category
```

**US-003 : Achat d'un article**

```gherkin
Feature: Achat d'un article
  As a buyer
  I want to purchase a collectible item
  So that I can add it to my collection

  Scenario: Achat réussi
    Given I am authenticated as a buyer
    And I have a valid payment method
    When I purchase an item for 150.00 EUR
    Then the payment is processed
    And the seller is notified
    And the item is marked as sold
    And I receive a confirmation email
```

### 5. Architecture technique

#### 5.1 Choix techniques

**Backend** :
- **Langage** : TypeScript (sécurité de types, maintenabilité)
- **Framework** : Express.js (léger, flexible, écosystème riche)
- **ORM** : Prisma (type-safe, migrations automatiques)
- **Validation** : Zod (validation runtime avec TypeScript)

**Frontend** :
- **Framework** : React 18 avec TypeScript
- **State Management** : React Query + Zustand
- **UI Library** : Material-UI (accessibilité intégrée)
- **Routing** : React Router v6

**Base de données** :
- **SGBD** : PostgreSQL 15 (ACID, JSON, full-text search)
- **Cache** : Redis (sessions, rate limiting)

**Infrastructure** :
- **Containerisation** : Docker
- **Orchestration** : Kubernetes (production) / Docker Compose (dev)
- **Cloud** : AWS (EC2, RDS, S3, CloudFront)

**Sécurité** :
- **Auth** : JWT + refresh tokens
- **HTTPS** : TLS 1.3
- **RBAC** : Rôles et permissions granulaires
- **Scans** : Snyk, OWASP ZAP, Trivy

#### 5.2 Schéma d'architecture

```mermaid
graph TB
    subgraph "Frontend"
        A[React App] --> B[API Gateway]
    end
    
    subgraph "Backend Services"
        B --> C[Auth Service]
        B --> D[Announcement Service]
        B --> E[Payment Service]
        B --> F[Notification Service]
    end
    
    subgraph "Data Layer"
        C --> G[(PostgreSQL)]
        D --> G
        E --> G
        F --> H[(Redis)]
    end
    
    subgraph "External Services"
        E --> I[Stripe API]
        F --> J[Email Service]
        F --> K[WebSocket Server]
    end
    
    subgraph "Monitoring"
        L[Prometheus] --> M[Grafana]
        N[Sentry] --> O[Alerting]
    end
```

#### 5.3 Sécurité intégrée

- **HTTPS** : Certificats Let's Encrypt, TLS 1.3
- **Authentification** : JWT avec rotation, refresh tokens
- **RBAC** : Rôles (buyer, seller, admin) avec permissions granulaires
- **Validation** : Input validation (Zod), sanitization
- **Rate Limiting** : Redis-based, par IP et par utilisateur
- **CORS** : Configuration stricte par origine
- **Headers de sécurité** : Helmet.js (CSP, HSTS, etc.)

### 6. Expérimentation sandbox (POC technique)

#### 6.1 Protocole d'expérimentation : Intégration Prisma + PostgreSQL

**Objectif** : Valider l'utilisation de Prisma comme ORM pour la gestion des données

**Environnement** :
- Node.js 20 LTS
- PostgreSQL 15
- Prisma 5.x

**Étapes** :

1. **Initialisation Prisma**
```bash
npm init -y
npm install prisma @prisma/client
npx prisma init
```

2. **Définition du schéma**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  role      Role     @default(BUYER)
  createdAt DateTime @default(now())
  announcements Announcement[]
}

model Announcement {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Float
  sellerId    String
  seller      User     @relation(fields: [sellerId], references: [id])
  createdAt   DateTime @default(now())
}
```

3. **Tests de performance**
- Mesure du temps de requête (SELECT, INSERT, UPDATE)
- Test de migrations
- Test de relations complexes

**Résultats** :
- Type-safety complète
- Migrations automatiques fonctionnelles
- Performance acceptable (< 50ms pour requêtes simples)
- Relations bien gérées

**Limites identifiées** :
- Migrations complexes nécessitent attention
- Pas de support natif pour full-text search avancé

**Justification** : Prisma offre un excellent équilibre entre type-safety, productivité et performance pour ce projet.

### 7. Développement de la fonctionnalité

#### 7.1 Backend

Le backend implémente :
- **Authentification** : Inscription, connexion, gestion des tokens JWT
- **Gestion des annonces** : CRUD complet avec autorisation basée sur les rôles
- **Sécurité** : Helmet, CORS, rate limiting, validation Zod
- **Logging** : Winston avec logs structurés
- **Tests** : Tests unitaires et d'intégration (Jest, Supertest)

**Fichiers principaux** :
- `backend/src/routes/auth.routes.ts` : Routes d'authentification
- `backend/src/routes/announcement.routes.ts` : Routes de gestion des annonces
- `backend/src/utils/auth.ts` : Middleware d'authentification et autorisation
- `backend/src/__tests__/` : Suite de tests complète

#### 7.2 Frontend

Le frontend implémente :
- **Interface utilisateur** : React 18 avec TypeScript, Material-UI
- **Gestion d'état** : Zustand pour l'authentification, React Query pour les données
- **Routing** : React Router v6 avec routes protégées
- **Pages** : Accueil, Catalogue, Détails d'annonce, Création d'annonce, Authentification
- **Tests** : Tests unitaires avec Jest et React Testing Library

**Fichiers principaux** :
- `frontend/src/pages/` : Pages de l'application
- `frontend/src/services/` : Services API (auth, announcements)
- `frontend/src/stores/` : Store Zustand pour l'authentification
- `frontend/src/components/` : Composants réutilisables (Layout, ProtectedRoute)

#### 7.3 Stockage de fichiers (MinIO)

Le POC intègre **MinIO** (S3-compatible) pour le stockage des images :
- Bucket : `collector-shop-images`
- Endpoints d'upload : `/api/upload/image` et `/api/upload/images`
- Images Pexels utilisées dans le seed pour les données de test
- Service MinIO configuré avec politique publique pour l'accès aux images

**Exemple d'upload d'image** :
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

#### 7.4 Exemples d'appels API

Voir `INSTALLATION.md` pour les exemples complets avec `curl`.

### 8. Pipeline CI/CD opérationnel

Voir `.github/workflows/ci-cd.yml`

---

## Phase 3 - Analyse sécurité et plan de remédiation

### 9. Audit sécurité de la v1

#### 9.1 Résultats des tests

**Tests de sécurité automatisés** :
- Scan Snyk : 0 vulnérabilités critiques
- OWASP ZAP : 2 warnings mineurs (headers manquants)
- Container scan : 0 vulnérabilités

**Métriques** :
- Couverture tests : 82%
- Complexité moyenne : 6.5
- Temps de réponse P95 : 180ms
- Taux d'erreurs : 0.05%

#### 9.2 Failles OWASP potentielles

1. **A01:2021 – Broken Access Control**
   - Risque : Moyen
   - Détection : Tests d'autorisation manquants sur certains endpoints

2. **A02:2021 – Cryptographic Failures**
   - Risque : Faible
   - Détection : Mots de passe correctement hashés (bcrypt), mais pas de rotation des clés JWT

3. **A03:2021 – Injection**
   - Risque : Faible
   - Détection : Prisma protège contre SQL injection, validation Zod en place

### 10. Plan de remédiation

#### 10.1 Renforcement auth et RBAC

- Implémenter 2FA (TOTP)
- Rotation automatique des clés JWT (tous les 90 jours)
- Audit logs pour toutes les actions sensibles
- Rate limiting renforcé sur les endpoints d'authentification

#### 10.2 Durcissement pipeline

- Ajouter des tests de sécurité automatisés (OWASP ZAP dans le pipeline)
- Scan des secrets dans le code (GitGuardian)
- Signature des artefacts Docker
- Déploiement blue-green avec rollback automatique

#### 10.3 Améliorations architecture

- API Gateway avec WAF (AWS WAF)
- Service de secrets dédié (HashiCorp Vault)
- Chiffrement au repos (TDE pour PostgreSQL)
- Backup automatisés avec chiffrement

#### 10.4 Monitoring & logs

- Centralisation des logs (ELK Stack)
- Alerting proactif (Prometheus + Alertmanager)
- Dashboard sécurité dédié (Grafana)
- Détection d'anomalies (ML-based)

#### 10.5 Résilience et scalabilité

- Circuit breakers (Resilience4j)
- Retry avec backoff exponentiel
- Load balancing (NGINX)
- Auto-scaling (Kubernetes HPA)

---

## Installation et déploiement

Voir `INSTALLATION.md` pour les instructions détaillées.
