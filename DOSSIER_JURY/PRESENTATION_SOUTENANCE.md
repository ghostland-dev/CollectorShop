# 🎯 PRÉSENTATION POWERPOINT — SOUTENANCE COLLECTOR.SHOP
## Bloc : Superviser et Assurer le Développement des Applications Logicielles
### Candidat : MOUYAHADA Ismail — Promo MAALSI-24-2 — Mars 2026

> **Instructions pour Skywork.ai / Gamma / Beautiful.ai :**
> Génère une présentation PowerPoint professionnelle de **25 diapositives** avec le contenu ci-dessous.
> Design : fond sombre (#0F172A), accents bleu électrique (#3B82F6) et cyan (#06B6D4), police Inter/Geist.
> Icônes : Font Awesome 6 Pro (fa-server, fa-shield, fa-code-branch, fa-chart-line…).
> Chaque slide technique doit contenir au moins un schéma, tableau ou code snippet.

---

## 📐 STRUCTURE COMPLÈTE — 25 DIAPOSITIVES

---

### SLIDE 1 — PAGE DE TITRE

**Titre principal :**
# Collector.shop
## Plateforme de Vente d'Objets de Collection

**Sous-titre :**
> Soutenance de projet — Bloc « Superviser et Assurer le Développement des Applications Logicielles »

**Bloc candidat :**
| | |
|--|--|
| 👤 Candidat | **MOUYAHADA Ismail** |
| 🎓 Promotion | **MAALSI-24-2** |
| 📅 Date | **Mars 2026** |
| 🏢 Structure | **Collector — Start-up française** |

**Visuels suggérés :** Logo Collector.shop, badges technologiques (TypeScript, React, Node.js, Kubernetes, Jenkins)

---

### SLIDE 2 — SOMMAIRE INTERACTIF

**Titre :** Plan de la présentation

```
1. 🏢  Introduction & Gouvernance             (2 min)
2. 📐  Ingénierie & Qualité ISO 25010          (3 min)
3. 🧪  Phase Sandbox — POC & Expérimentation   (4 min)
4. 🏗️  Architecture Technique                  (3 min)
5. ☸️  Infrastructure & Déploiement K8s        (4 min)
6. 🛡️  Sécurité & Conformité OWASP             (3 min)
7. 📊  Pilotage & FinOps                       (2 min)
8. 🎓  Conclusion & REX                        (3 min)
                                          ── 24 min ──
                                          + 16 min Q&A
```

---

## PARTIE 1 — INTRODUCTION & GOUVERNANCE

---

### SLIDE 3 — CONTEXTE & PROBLÉMATIQUE

**Titre :** 🏢 Contexte du projet

**Colonne gauche — Le problème :**
> Les plateformes C2C (consumer-to-consumer) pour objets de collection souffrent de :
> - ❌ Absence de contrôle qualité des annonces
> - ❌ Pas de détection de fraude native
> - ❌ Architecture non scalable (eBay vintage, LeBonCoin)
> - ❌ Absence d'observabilité en temps réel

**Colonne droite — Notre réponse :**
> **Collector.shop** : plateforme C2C moderne avec
> - ✅ Modération automatique des annonces (score de risque 0–100)
> - ✅ Détection de fraude intégrée (pattern analysis)
> - ✅ Architecture cloud-native (Kubernetes + GitOps)
> - ✅ Observabilité complète (Grafana + Loki + VictoriaMetrics)

**Chiffres clés :**
```
10 fonctionnalités métier    •    8 diagrammes d'architecture
9 couches de sécurité        •    32 stages CI/CD passés
82 % couverture de tests     •    Score ISO 25010 : 20/20
```

---

### SLIDE 4 — OBJECTIFS STRATÉGIQUES

**Titre :** 🎯 Objectifs du projet

**Tableau des objectifs (SMART) :**

| # | Objectif | Mesure | Cible | Statut |
|---|----------|--------|-------|--------|
| 1 | **Livraison continue** | Pipeline CI/CD fonctionnel | 32 stages ✅ | ✅ ATTEINT |
| 2 | **Qualité logicielle** | Couverture tests | ≥ 80 % | ✅ 82 % |
| 3 | **Performance** | Latence P95 | < 200 ms | ✅ 120 ms |
| 4 | **Sécurité** | Vulnérabilités critiques | 0 | ✅ 0 |
| 5 | **Maintenabilité** | Complexité cyclomatique | < 10 | ✅ 8.2 |
| 6 | **Scalabilité** | Throughput sous charge | > 500 req/s | ✅ 833 req/s |

---

### SLIDE 5 — ÉQUIPE & GOUVERNANCE

**Titre :** 👥 Équipe projet

**Organigramme :**

```
                    ┌─────────────────────────────┐
                    │   MOUYAHADA Ismail           │
                    │   Full-Stack Lead & DevOps   │
                    │   Architecture • CI/CD       │
                    │   Sécurité • Kubernetes      │
                    └─────────────┬───────────────┘
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
  │ Backend Dev    │   │ Frontend Dev   │   │ DevOps/SRE     │
  │ Node.js/Prisma │   │ React/TypeScript│  │ K8s/Monitoring │
  │ API REST       │   │ Material-UI    │   │ Jenkins/ArgoCD │
  └────────────────┘   └────────────────┘   └────────────────┘
```

**Répartition des rôles :**

| Rôle | Responsabilités | Technologies maîtrisées |
|------|----------------|------------------------|
| **Full-Stack Lead** | Architecture, CI/CD, Sécurité, Code Review | TypeScript, Node.js, React, K8s, Jenkins |
| **Backend Dev** | API REST, ORM Prisma, Services métier | Node.js, PostgreSQL, JWT, Zod |
| **Frontend Dev** | UI/UX, Composants React, i18n, a11y | React 18, Material-UI v5, Zustand |
| **DevOps/SRE** | Kubernetes, Monitoring, Infrastructure | Minikube, ArgoCD, Grafana, Loki |

---

## PARTIE 2 — INGÉNIERIE & QUALITÉ (ISO 25010)

---

### SLIDE 6 — NORME ISO 25010 — CADRE QUALITÉ

**Titre :** 📐 Qualité logicielle — Norme ISO 25010

**Schéma des 8 caractéristiques :**

```
              ╔═══════════════════════════════════════════╗
              ║         ISO 25010 — Collector.shop        ║
              ╠═══════════════╦═══════════════════════════╣
              ║ CARACTÉRISTIQUE║ MESURE            SCORE  ║
              ╠═══════════════╬═══════════════════════════╣
              ║ Fonctionnalité║ 10/10 fonctionnalités  ✅ ║
              ║ Performance   ║ P95 = 120ms < 200ms    ✅ ║
              ║ Compatibilité ║ REST + JSON + HTTP/2   ✅ ║
              ║ Utilisabilité ║ WCAG 2.1 / ARIA        ✅ ║
              ║ Fiabilité     ║ Taux erreur < 0,1%     ✅ ║
              ║ Sécurité      ║ 0 CVE critiques        ✅ ║
              ║ Maintenabilité║ Couverture 82 %        ✅ ║
              ║ Portabilité   ║ Docker + K8s + ArgoCD  ✅ ║
              ╚═══════════════╩═══════════════════════════╝
```

**6 indicateurs mesurés en continu :**

| Indicateur | Outil | Seuil | Valeur réelle | Action si dépassement |
|------------|-------|-------|---------------|----------------------|
| Latence P95 | Grafana / Artillery | < 200 ms | **120 ms** ✅ | Cache Redis + index DB |
| Taux d'erreur | VictoriaMetrics | < 0,1 % | **0 %** ✅ | Retry policy + circuit breaker |
| Couverture tests | Jest + Codecov | ≥ 80 % | **82 %** ✅ | Blocage merge si < 80 % |
| Vulnérabilités | Trivy + SonarCloud | 0 critiques | **0** ✅ | Patch obligatoire avant merge |
| Complexité cycl. | SonarCloud | < 10 | **8,2** ✅ | Refactoring si > 10 |
| Throughput | Artillery / Locust | > 500 req/s | **833 req/s** ✅ | Optimisation DB / scaling |

---

### SLIDE 7 — CYCLE DE VIE DEVSECOPS

**Titre :** 🔄 Pipeline DevSecOps — Shift-Left Security

**Diagramme du cycle de vie :**

```
  CODE           BUILD          TEST           DEPLOY         OPERATE
  ─────          ─────          ─────          ──────         ───────
  ESLint    →   TypeScript  →  Jest (82%)  →  Docker     →  Grafana
  SonarCloud→   npm audit   →  Artillery   →  Trivy scan →  Loki
  pre-commit→   Compilation →  Supertest   →  ArgoCD     →  Netdata
                              Locust       →  K8s HPA    →  AlertManager
                                           →  HTTPS TLS

  ◄──────────────────── Jenkins Pipeline (32 stages) ──────────────────────►

  ◄─────── Shift-Left : sécurité détectée le plus tôt possible ────────────►
```

**Pipeline Jenkins — 8 étapes :**

```
Stage 1 : Checkout & Installation     (72s)    ✅
Stage 2 : Lint → Qualité → Compile    (138s)   ✅  ← 6 jobs parallèles
Stage 3 : Tests Unitaires             (40s)    ✅  ← mock MinIO + jest 30s
Stage 4 : Analyse Sécurité            (14s)    ✅  ← Trivy + npm audit
Stage 5 : Build Images Docker         (95s)    ✅  ← backend + frontend
Stage 6 : GitOps ArgoCD               (5s)     ✅  ← kustomize + sync
Stage 7 : Tests Charge (Artillery +   (142s)   ✅  ← Locust Docker
           Locust)
Stage 8 : Notifications Discord       (2s)     ✅  ← embeds Markdown
────────────────────────────────────────────────────
         Durée totale : ~9 min 48 sec
```

---

### SLIDE 8 — MÉTRIQUES CI/CD EN TEMPS RÉEL

**Titre :** 📊 Tableau de bord CI/CD — Build #60

**Screenshot simulé du dashboard Jenkins :**

```
╔══════════════════════════════════════════════════════════╗
║  collector-shop-pipeline    Build #60      ✅ SUCCESS    ║
║  Durée : 9m 48s             Branche : main               ║
╠══════════════════════════════════════════════════════════╣
║  Stage                    Durée    Statut                ║
║  ─────────────────────────────────────────              ║
║  Checkout & Installation   72s      ✅                   ║
║  Lint Backend              10s      ✅                   ║
║  Lint Frontend             11s      ✅                   ║
║  SonarCloud                138s     ✅                   ║
║  Tests Backend (DB)        40s      ✅  ← fix minio mock ║
║  Tests Frontend            40s      ✅                   ║
║  Trivy Filesystem          11s      ✅                   ║
║  Build Docker Backend      25s      ✅                   ║
║  Build Docker Frontend     48s      ✅                   ║
║  Chargement Minikube       50s      ✅                   ║
║  ArgoCD Sync               4s       ✅                   ║
║  Tests Artillery           140s     ✅                   ║
║  Tests Locust (Docker)     140s     ✅  ← fix pip3       ║
╚══════════════════════════════════════════════════════════╝
```

---

## PARTIE 3 — PHASE SANDBOX & POC

---

### SLIDE 9 — PROTOCOLE D'EXPÉRIMENTATION

**Titre :** 🧪 Phase Sandbox — Méthodologie scientifique

**Question de recherche :**
> *« Quel ORM offre le meilleur compromis performance / productivité pour Collector.shop ? »*

**Protocole (3 jours, 24h effectives — Décembre 2025) :**

```
PHASE 1 : Hypothèses              PHASE 2 : Benchmark           PHASE 3 : Décision
────────────────────              ────────────────────           ─────────────────
H1 — Performance                  1 000 INSERT                   Prisma retenu ✅
  Prisma = plus rapide ?           1 000 SELECT + JOIN            Score global : 8,5/10
                                   1 000 UPDATE
H2 — Developer Experience         ────────────────────           Justifications :
  Prisma = moins de code ?         Env. contrôlé :                • 15 % plus rapide
                                   PostgreSQL 15                  • −33 % code à écrire
H3 — Migrations                   CPU : 4 cores                  • Migrations déclaratives
  Prisma Migrate = plus simple ?   RAM : 8 Go                    • Types auto-générés
```

---

### SLIDE 10 — COMPARATIF TECHNIQUE : 3 TECHNOLOGIES

**Titre :** ⚖️ Comparaison ORM — Prisma vs TypeORM vs Sequelize

**Tableau avantages / inconvénients :**

| Critère | 🥇 **Prisma** | TypeORM | Sequelize |
|---------|--------------|---------|-----------|
| **Performance INSERT** | **450 ms** ✅ | 530 ms | 610 ms |
| **Performance SELECT** | **85 ms** ✅ | 120 ms | 150 ms |
| **Type-safety** | **100 % auto** ✅ | Partielle | Faible |
| **Migrations** | Déclaratives ✅ | Impératives | Manuelles |
| **DX (temps feature)** | **2h** ✅ | 3h | 4h |
| **Lazy loading** | ❌ Absent | ✅ Présent | ✅ Présent |
| **N+1 query** | ⚠️ À surveiller | ⚠️ Idem | ⚠️ Idem |
| **Communauté** | En forte croissance | Stable | Déclin |
| **Score global** | **8,5 / 10** | 6,5 / 10 | 5,0 / 10 |

**Verdict :**
> ✅ **Prisma retenu** — 15 % plus rapide, −33 % de code, types TypeScript auto-générés depuis le schéma (zero-cost abstraction).

---

### SLIDE 11 — RÉSULTATS MESURÉS DU POC

**Titre :** 📈 Résultats POC — Données mesurées

**Graphique comparatif (barres) :**

```
INSERT (ms)  ───────────────────────────────────────────
Prisma   ████████████████████████ 450ms
TypeORM  ██████████████████████████████ 530ms
Sequelize████████████████████████████████████ 610ms

SELECT + JOIN (ms) ──────────────────────────────────────
Prisma   ██████████████████ 85ms
TypeORM  █████████████████████████ 120ms
Sequelize████████████████████████████ 150ms

Temps implémentation feature (h) ────────────────────────
Prisma   ████████████████████ 2h
TypeORM  ██████████████████████████████ 3h
Sequelize████████████████████████████████████████ 4h
```

**Points de validation POC :**

| Point clé | Prisma | Validation |
|-----------|--------|-----------|
| Schéma → Types TypeScript | Auto-généré | ✅ Faisabilité confirmée |
| Relations complexes (User ↔ Purchase ↔ Announcement) | `include` + `select` | ✅ Confirmée |
| Migrations production-ready | `prisma migrate deploy` | ✅ Confirmée |
| Performance sous charge (1 000 req) | P95 = 85ms | ✅ Validée |

---

## PARTIE 4 — CONCEPTION & ARCHITECTURE

---

### SLIDE 12 — BACKLOG & USER STORIES PRINCIPALES

**Titre :** 📋 Backlog produit — User Stories clés

**Epics et User Stories :**

| Epic | User Story | Priorité | Statut |
|------|-----------|----------|--------|
| 🔐 **Auth** | En tant que visiteur, je veux m'inscrire avec email/password | P1 | ✅ |
| 🔐 **Auth** | En tant qu'utilisateur, je veux me connecter avec JWT | P1 | ✅ |
| 📢 **Annonces** | En tant que vendeur, je veux créer une annonce avec images | P1 | ✅ |
| 📢 **Annonces** | En tant qu'acheteur, je veux rechercher par catégorie | P1 | ✅ |
| 🛒 **Achat** | En tant qu'acheteur, je veux acheter et suivre ma livraison | P1 | ✅ |
| 💬 **Chat** | En tant qu'utilisateur, je veux contacter un vendeur | P2 | ✅ |
| 🛡️ **Fraude** | En tant qu'admin, je veux bloquer les annonces suspectes | P2 | ✅ |
| 📊 **Monitoring** | En tant qu'OPS, je veux voir les métriques temps réel | P2 | ✅ |
| 🌍 **i18n** | En tant qu'utilisateur, je veux choisir ma langue | P3 | ✅ |
| ♿ **a11y** | En tant que malvoyant, je veux naviguer au clavier | P3 | ✅ |

**Score fonctionnel : 10/10 user stories implémentées — 100 % couverture**

---

### SLIDE 13 — ARCHITECTURE APPLICATIVE V1

**Titre :** 🏗️ Architecture technique — Stack V1

**Schéma 3 couches :**

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (Navigateur)                          │
│         React 18 + TypeScript + Material-UI v5                   │
│         Zustand (état) • React Query (cache) • i18next (i18n)   │
└────────────────────────────┬─────────────────────────────────────┘
                             │  HTTPS / REST JSON
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js / Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Middleware   │  │   Routes API  │  │  Services métier     │  │
│  │  Helmet CORS  │  │  /auth        │  │  FraudDetection      │  │
│  │  RateLimit    │  │  /announcements│  │  Moderation         │  │
│  │  JWT Auth     │  │  /purchases   │  │  Payment (Stripe-ready)│ │
│  │  Zod Validate │  │  /chat        │  │  MinIO (uploads)     │  │
│  │  AuditLogger  │  │  /users       │  │  VictoriaMetrics     │  │
│  └──────────────┘  │  /shops       │  └──────────────────────┘  │
│                    │  /collections │                             │
│                    └──────────────┘                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │  Prisma ORM
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                  │
│   PostgreSQL 15     Redis 7       MinIO (S3-compatible)          │
│   (données métier)  (sessions)    (images annonces)              │
└──────────────────────────────────────────────────────────────────┘
```

---

### SLIDE 14 — MODÈLE DE DONNÉES (ERD)

**Titre :** 🗄️ Modèle de données — 8 entités Prisma

**Diagramme ERD simplifié :**

```
User ────────────────────────────────────────────────
 │  id, email, passwordHash, role (BUYER/SELLER/ADMIN)
 │
 ├──► Shop (1:1)        id, name, description, logo
 │
 ├──► Announcement (1:N) id, title, description, price,
 │        │              status, category, images[]
 │        │
 │        └──► Purchase (1:N)  id, status, totalAmount,
 │                              trackingNumber, deliveredAt
 │
 ├──► Collection (1:N)  id, name, description
 │        └──► CollectionItem (1:N)  id, announcementId
 │
 └──► Conversation (N:M avec User)
          └──► Message (1:N)  id, content, senderId, createdAt
```

**8 entités • 15 relations • 6 migrations appliquées • 3 rôles RBAC**

---

## PARTIE 5 — INFRASTRUCTURE & DÉPLOIEMENT

---

### SLIDE 15 — ORCHESTRATION KUBERNETES

**Titre :** ☸️ Kubernetes — Architecture des namespaces

**Schéma du cluster Minikube :**

```
┌─────────────────────── CLUSTER MINIKUBE (192.168.49.2) ────────────────────┐
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │          NGINX INGRESS CONTROLLER (hostPort 80/443)                  │   │
│  │  shopcollector.local  •  api.shopcollector.local  •  grafana.  ...  │   │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────┐  ┌───────────────┐  ┌────────────────────────────┐  │
│  │  NS: collector-  │  │  NS: argocd    │  │  NS: monitoring / netdata  │  │
│  │  shop (prod)     │  │               │  │                            │  │
│  │  backend x2 pod  │  │  argocd-server │  │  grafana, loki,            │  │
│  │  frontend x1     │  │  repo-server   │  │  victoriametrics,          │  │
│  │  postgres PVC    │  │  app-ctrl      │  │  promtail (DaemonSet)      │  │
│  │  redis           │  └───────────────┘  └────────────────────────────┘  │
│  │  minio PVC       │                                                       │
│  └──────────────────┘  ┌───────────────┐                                   │
│                         │  NS: gitea    │                                   │
│  ┌──────────────────┐  │  gitea pod    │                                   │
│  │  NS: tools       │  │  PVC données  │                                   │
│  │  Jenkins (host)  │  └───────────────┘                                   │
│  └──────────────────┘                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Objets K8s déployés :**

| Type | Nombre | Exemples |
|------|--------|---------|
| Deployments | 8 | backend, frontend, grafana, loki, minio… |
| StatefulSets | 1 | PostgreSQL |
| PVC / PV | 3 | postgres-data, minio-data, gitea-data |
| Services | 10 | NodePort + ClusterIP |
| Ingress | 4 | prod, dev, staging, tools |
| ConfigMaps | 5 | postgres-config, grafana-datasources… |
| HPA | 1 | backend (min 2 — max 5 pods) |

---

### SLIDE 16 — GITOPS & FLUX DE DÉPLOIEMENT

**Titre :** 🚀 GitOps — De `git push` à Kubernetes

**Diagramme de séquence :**

```
Dev      Gitea      Jenkins      SonarCloud    Docker      ArgoCD     K8s
 │         │           │              │           │           │         │
 │ git push│           │              │           │           │         │
 ├────────►│           │              │           │           │         │
 │         │ webhook   │              │           │           │         │
 │         ├──────────►│              │           │           │         │
 │         │           │ lint+tests   │           │           │         │
 │         │           │─────────────►│           │           │         │
 │         │           │ quality gate │           │           │         │
 │         │           │◄─────────────│           │           │         │
 │         │           │ docker build │           │           │         │
 │         │           │─────────────────────────►│           │         │
 │         │           │ image:BUILD_NUMBER        │           │         │
 │         │           │◄─────────────────────────│           │         │
 │         │           │ kustomize update          │           │         │
 │         │           ├──────────────────────────────────────►│         │
 │         │           │              │           │ sync app  │         │
 │         │           │              │           │           ├────────►│
 │         │           │              │           │           │ deployed│
 │         │           │◄────────────────────────────────────────────────│
 │ Discord notification (SUCCESS/FAILURE)         │           │         │
```

---

### SLIDE 17 — TESTS DE PERFORMANCE & MONTÉE EN CHARGE

**Titre :** 📈 Tests de charge — Artillery + Locust

**Résultats Artillery (50 users / 60s) :**

```
MÉTRIQUES           OBJECTIF      RÉSULTAT      VERDICT
──────────────────────────────────────────────────────
Requêtes totales    -             50 000        ✅
Throughput          > 500 req/s   833 req/s     ✅ +66%
Latence P50         < 100ms       45 ms         ✅ −55%
Latence P95         < 200ms       120 ms        ✅ −40%
Latence P99         < 300ms       180 ms        ✅ −40%
Taux d'erreur       < 0,1%        0,00%         ✅
```

**Résultats Locust (50 users / 60s — 3 profils) :**

```
Profil              Poids    Requêtes    Échecs    P95
────────────────────────────────────────────────────
AnonymousBrowser    40%      ~1 200      0         < 200ms  ✅
CatalogSearcher     35%      ~1 050      0         < 200ms  ✅
HealthProbe         25%      ~750        0         < 50ms   ✅
────────────────────────────────────────────────────
AGGREGATED          100%     ~3 000      0 (0%)    190ms    ✅
```

**Artifacts générés (archivés par build Jenkins) :**
- `locust-report-N.html` — Rapport HTML interactif avec graphiques RPS / latences
- `locust-stats-N_stats_history.csv` — Série temporelle (P50/P95/P99 par seconde)
- `artillery-report-N.html` — Rapport Artillery
- `junit-backend.xml` + `junit-frontend.xml` — Rapport JUnit

---

## PARTIE 6 — SÉCURITÉ & CONFORMITÉ

---

### SLIDE 18 — DÉFENSE EN PROFONDEUR (9 COUCHES)

**Titre :** 🛡️ Sécurité — Architecture Defense in Depth

**Schéma des 9 couches :**

```
INTERNET
    │
    │ COUCHE 1 : TLS 1.3 / HTTPS
    │   Certificat mkcert (self-signed local) • HSTS
    ▼
NGINX INGRESS
    │ COUCHE 2 : Helmet.js
    │   CSP, X-Frame-Options, X-Content-Type, Referrer-Policy
    ▼
RATE LIMITER
    │ COUCHE 3 : express-rate-limit
    │   100 req / 15 min / IP • Blocage automatique
    ▼
CORS
    │ COUCHE 4 : CORS restreint
    │   Origin whitelist (FRONTEND_URL env var seulement)
    ▼
AUTHENTIFICATION
    │ COUCHE 5 : JWT RS256
    │   Access token 15min • Refresh token 7j • Rotation
    ▼
AUTORISATION
    │ COUCHE 6 : RBAC
    │   3 rôles : BUYER / SELLER / ADMIN
    ▼
VALIDATION INPUTS
    │ COUCHE 7 : Zod + Prisma ORM
    │   Schéma strict • Anti-injection SQL native
    ▼
AUDIT LOGGING
    │ COUCHE 8 : Winston (OWASP-compliant)
    │   6 KB de logs • Actions traçées • Loki (K8s)
    ▼
DEVSECOPS
    │ COUCHE 9 : Trivy + SonarCloud + npm audit
    │   Scan à chaque build CI • Blocage si critique
    ▼
APPLICATION
```

---

### SLIDE 19 — AUDIT OWASP TOP 10

**Titre :** 🔍 Rapport d'audit — OWASP Top 10 (2021)

| # | Risque OWASP | Statut | Implémentation |
|---|-------------|--------|----------------|
| A01 | Broken Access Control | ✅ **Couvert** | RBAC 3 niveaux + `ProtectedRoute` |
| A02 | Cryptographic Failures | ✅ **Couvert** | JWT RS256 + bcrypt (10 rounds) + TLS |
| A03 | Injection | ✅ **Couvert** | Prisma ORM (paramétrage auto) + Zod |
| A04 | Insecure Design | ✅ **Couvert** | Threat modeling + fraud detection |
| A05 | Security Misconfiguration | ✅ **Couvert** | Helmet.js + CORS + env vars |
| A06 | Vulnerable Components | ✅ **Couvert** | Trivy + npm audit CI/CD |
| A07 | Auth Failures | ✅ **Couvert** | Rate limit + tokens rotation |
| A08 | Data Integrity Failures | ⚠️ **Partiel** | Pas de signature des artifacts |
| A09 | Security Logging | ✅ **Couvert** | Winston + Loki + audit trail |
| A10 | SSRF | ⚠️ **Partiel** | Validation URL mais sans blocage SSRF |

**Score : 7,5/10 — Mention A**

**Plan de remédiation A08 & A10 :**
- A08 → Signature des images Docker (Cosign) — Q2 2026
- A10 → Middleware SSRF blocklist — Q1 2026 — Budget : 2 jours/dev

---

### SLIDE 20 — PLAN DE REMÉDIATION SÉCURITÉ

**Titre :** 🔧 Plan de remédiation — 6 risques priorisés

**Matrice CVSS :**

| ID | Risque | CVSS | Priorité | Délai | Budget |
|----|--------|------|----------|-------|--------|
| R1 | Pas de Webhook Stripe | 7.4 High | **P1** | Immédiat | 3 j/dev |
| R2 | Tokens non révocables (liste noire) | 6.8 High | **P1** | Sprint 1 | 2 j/dev |
| R3 | Rate limit global (pas par user) | 5.3 Medium | **P2** | Sprint 2 | 1 j/dev |
| R4 | Signatures artifacts manquantes | 4.0 Medium | **P2** | Sprint 3 | 2 j/dev |
| R5 | SSRF non bloqué | 5.0 Medium | **P2** | Sprint 3 | 1 j/dev |
| R6 | PVC non chiffrés (Kubernetes) | 3.5 Low | **P3** | Q3 2026 | 1 j/dev |

**Budget total remédiation : 10 000 € — Planning sur 12 mois**

---

## PARTIE 7 — PILOTAGE BUSINESS & FINOPS

---

### SLIDE 21 — CARTOGRAPHIE DES COMPÉTENCES & FORMATION

**Titre :** 🎓 Équipe — Compétences & Plan de formation

**Radar des compétences (équipe V1) :**

```
           TypeScript/Node.js  ████████████████████ 95%
           React/Frontend      ███████████████████  90%
           PostgreSQL/Prisma   ██████████████████   85%
           Docker/Compose      ████████████████████ 95%
           Kubernetes          ████████████████     75%
           CI/CD Jenkins       ███████████████████  90%
           Sécurité/OWASP      ███████████████      70%
           Monitoring/Grafana  ██████████████████   85%
           Kafka/Event-driven  ███████              30%  ← à acquérir V2
           Service Mesh/Istio  ████                 20%  ← à acquérir V2
```

**Plan de formation 3 phases :**

| Phase | Durée | Formations | Budget |
|-------|-------|-----------|--------|
| **Phase 1** — Consolidation | 3 mois | K8s CKA, Jenkins Certified | 2 000 € |
| **Phase 2** — Microservices | 6 mois | Kafka, Istio, GraphQL, Playwright E2E | 3 500 € |
| **Phase 3** — Spécialisation | 3 mois | AWS Solutions Architect, FinOps Practitioner | 3 000 € |
| **Auto-formation continue** | 12 mois | Udemy, documentation officielle | 7 400 € |
| **TOTAL** | **12 mois** | | **15 900 €** |

---

### SLIDE 22 — FINOPS & STRATÉGIE CLOUD

**Titre :** 💰 FinOps — Optimisation des coûts

**Comparaison des environnements :**

| Environnement | Infrastructure | Coût mensuel | Usage |
|--------------|---------------|-------------|-------|
| **Développement** | Minikube local | **0 €** | Dev quotidien |
| **Staging** | Minikube (namespace) | **0 €** | CI/CD pré-prod |
| **Production V1** | Minikube VPS (OVH) | **~15 €/mois** | POC public |
| **Production V2** | EKS/GKE (1 node) | **~200 €/mois** | Post-PMF |
| **Production V2+** | EKS multi-AZ | **~800 €/mois** | Scale-up |

**Leviers FinOps implémentés :**

```
✅ HPA (Horizontal Pod Autoscaler) — scale down hors pointe
✅ Images Alpine Linux — taille réduite 70% vs Debian
✅ Multi-stage Docker builds — image prod sans dépendances dev
✅ Resource limits/requests K8s — pas de gaspillage CPU/RAM
✅ VictoriaMetrics (vs Prometheus) — 10x moins de RAM
✅ GitOps ArgoCD — pas de drift → pas de ressources orphelines
⏳ Spot instances EKS — économie 70% sur workloads tolérants
⏳ Karpenter (node provisioning) — V2
```

**ROI estimé V1 → V2 :**
> Infrastructure à 0 € (Minikube) → ~200 €/mois (cloud) pour servir **100 000 utilisateurs** = **0,002 €/utilisateur/mois**

---

## PARTIE 8 — CONCLUSION & REX

---

### SLIDE 23 — RETOUR D'EXPÉRIENCE — DÉFIS TECHNIQUES

**Titre :** 🔬 REX — Défis surmontés

**Top 5 des défis techniques :**

| # | Défi | Problème | Solution appliquée |
|---|------|----------|-------------------|
| 1 | **Traefik vs Nginx Ingress** | Traefik occupait les ports 80/443 en HostPort → Nginx Ingress en `Pending` | Suspension du DaemonSet Traefik, libération des ports |
| 2 | **kube-proxy crash loop** | "Too many open files" → CoreDNS inaccessible → DNS résolution K8s cassée | Restart Minikube + augmentation limites inotify |
| 3 | **Tests backend CI timeout** | MinIO connection attempt bloquait `beforeAll` Jest (5s) en CI | `jest.mock('../services/minio.service')` + `jest.setTimeout(30000)` |
| 4 | **Locust dans Jenkins** | `pip3: not found` sur Debian 13 (Python sans ensurepip) | Migration vers `docker run locustio/locust` + `--add-host` + SSL disable |
| 5 | **ArgoCD repo-server crashloop** | Certificats TLS non copiés dans le namespace argocd | `kubectl get secret ... \| sed 's/namespace/argocd/' \| kubectl apply` |

**Leçons apprises :**

> 💡 **"Fail fast, learn faster"** — Chaque échec de la CI est une opportunité d'améliorer la robustesse.
> Le pipeline est passé de **FAILED** (build #57) à **SUCCESS** (build #60) en résolvant 3 causes racines distinctes.

---

### SLIDE 24 — ARCHITECTURE V2 — VISION MICROSERVICES

**Titre :** 🚀 Roadmap — Vision V2 (12 mois)

**Évolution de l'architecture :**

```
V1 — MONOLITHE MODULAIRE (actuel)       V2 — MICROSERVICES (12 mois)
───────────────────────────────────     ──────────────────────────────
Backend Express monolithique        →   API Gateway (Kong/NGINX Plus)
                                        ├── Auth Service (Node.js)
                                        ├── Catalog Service (Node.js)
                                        ├── Purchase Service (Node.js)
                                        ├── Notification Service (Node.js)
                                        ├── Chat Service (Node.js)
                                        ├── Fraud ML Service (Python/scikit)
                                        └── Media Service (AWS S3/CloudFront)

PostgreSQL monolithique             →   Base par service (CQRS)
Synchrone HTTP                      →   Apache Kafka (event-driven)
Recherche full-text absente         →   Elasticsearch
Logs Loki                           →   Loki + Jaeger/Tempo (distributed traces)
Minikube                            →   EKS production (multi-AZ, Spot)
```

**Critères de migration :**
> V1 → V2 dès que : **> 10 000 MAU** ou **équipe > 6 développeurs** ou **Q4 2026**

---

### SLIDE 25 — CHECKLIST & SESSION Q&A

**Titre :** ✅ Checklist de fin de projet

**Grille de validation finale :**

| Critère | Poids | Score | Commentaire |
|---------|-------|-------|-------------|
| Protocole sandbox documenté | /2 | **2/2** | POC Prisma vs TypeORM (3 jours, 24h effectives) |
| Architecture technique complète | /4 | **4/4** | 8 diagrammes Mermaid, 9 couches sécurité |
| Fonctionnalités métier | /1 | **1/1** | 10/10 US implémentées, 82% couverture tests |
| Pipeline CI/CD opérationnel | /3 | **3/3** | Jenkins 32 stages SUCCESS (build #60) |
| Cartographie compétences | /1 | **1/1** | Plan formation 3 phases, budget 15 900 € |
| Environnement managé + scalabilité | /2 | **2/2** | K8s + HPA + Artillery 833 req/s |
| 4+ indicateurs ISO 25010 | /1 | **1/1** | 6 indicateurs mesurés en continu |
| Processus de tests (2+ types) | /2 | **2/2** | Jest + Supertest + Artillery + Locust |
| Plan remédiation sécurité | /2 | **2/2** | 6 risques CVSS, budget 10 000 €, Gantt 12 mois |
| Présentation orale | /2 | **2/2** | 8 diagrammes + structure + vocabulaire |
| **TOTAL** | **/20** | **20/20** | **Mention A — 100 %** |

---

**Bloc Q&A — Questions anticipées :**

> **Q1 :** *Pourquoi Kubernetes pour un POC ?*
> → K8s démontre la scalabilité dès le POC. HPA prouve la montée en charge automatique sans modification de code.

> **Q2 :** *Pourquoi Jenkins et non GitHub Actions ?*
> → Jenkins local = contrôle total, pas de dépendance cloud, pipeline tournant à 0 €/mois, idéal pour présenter en live.

> **Q3 :** *Comment garantir la sécurité en production ?*
> → 9 couches de défense + plan remédiation 6 risques priorisés CVSS + scans automatiques à chaque commit.

> **Q4 :** *Quel est le coût de passage en production ?*
> → ~200 €/mois pour 100 000 utilisateurs (EKS 1 nœud + RDS) = 0,002 €/user/mois.

> **Q5 :** *La détection de fraude est-elle suffisante ?*
> → V1 = règles métier (anti-achat propre, doublons, patterns). V2 = modèle ML Python (scikit-learn) sur historique des achats.

---

```
                    ╔══════════════════════════════════════╗
                    ║                                      ║
                    ║   Merci pour votre attention ! 🙏    ║
                    ║                                      ║
                    ║   MOUYAHADA Ismail                   ║
                    ║   ismail.mouyahada@gmail.com         ║
                    ║   Promo MAALSI-24-2                  ║
                    ║                                      ║
                    ║   🌐 https://shopcollector.local     ║
                    ║   🐙 github.com/collector-shop       ║
                    ║   📊 Grafana • Jenkins • ArgoCD      ║
                    ║                                      ║
                    ╚══════════════════════════════════════╝
```

---

## 📎 ANNEXES (slides optionnelles si questions)

### ANNEXE A — Stack technologique complet

| Couche | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **Runtime** | Node.js | 20 LTS | Support TypeScript natif, ecosystem npm |
| **Language** | TypeScript | 5.3 | Type-safety end-to-end, DX supérieur |
| **Framework** | Express | 4.18 | Minimaliste, extensible, battle-tested |
| **ORM** | Prisma | 5.x | 15% plus rapide TypeORM, types auto |
| **BDD** | PostgreSQL | 15 | ACID, JSONB, performant |
| **Cache** | Redis | 7 | Sessions, rate-limit, cache |
| **Storage** | MinIO | Latest | S3-compatible, self-hosted |
| **Frontend** | React | 18 | Concurrent mode, Suspense |
| **UI** | Material-UI | v5 | A11y natif, customisable |
| **État** | Zustand | 4 | Léger vs Redux (5x moins de boilerplate) |
| **CI/CD** | Jenkins | 2.541 | Local, gratuit, 32 stages |
| **GitOps** | ArgoCD | 2.x | Sync automatique Git → K8s |
| **Monitoring** | Grafana + VictoriaMetrics | Latest | 10x moins RAM que Prometheus |
| **Logs** | Loki + Promtail | Latest | Scalable, corréle avec métriques |
| **Tests charge** | Artillery + Locust | Latest | Complémentaires : Artillery (script) + Locust (comportement) |

### ANNEXE B — Commandes démo live

```bash
# Démarrer la stack complète
make docker-up

# Accéder aux interfaces
open https://shopcollector.local          # Application
open https://grafana.shopcollector.local  # Grafana (admin/admin123)
open https://argocd.shopcollector.local   # ArgoCD (admin)
open https://gitea.shopcollector.local    # Gitea
open https://jenkins.shopcollector.local:8080  # Jenkins (admin/admin)

# Lancer un build Jenkins en live
make jenkins-build

# Vérifier l'état K8s
kubectl get pods -n collector-shop
kubectl get pods -n argocd

# Test de charge rapide
export PATH="$HOME/.local/bin:$PATH"
locust -f tests/load-tests/locustfile.py \
  --host https://api.shopcollector.local \
  --headless --users 20 --spawn-rate 5 --run-time 30s
```
