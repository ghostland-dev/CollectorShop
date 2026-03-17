# 🏗️ Infrastructure Minikube — ArgoCD + Netdata + Jenkins

**Projet** : Collector.shop  
**Date** : Mars 2026  
**Stack** : Minikube · ArgoCD (GitOps) · Netdata (Monitoring) · Jenkins (CI/CD)

---

## 📐 Architecture Globale

```
┌──────────────────────────────────────────────────────────────────────┐
│                          DÉVELOPPEUR                                  │
│                    git push → GitHub                                  │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ SCM webhook / poll (2 min)
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     JENKINS (docker-compose)                          │
│  ┌──────────┐ ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────────────┐  │
│  │ Checkout │→│ Lint │→│ Build TS │→│ Tests  │→│ Docker Build   │  │
│  └──────────┘ └──────┘ └──────────┘ │ Unit   │ └────────────────┘  │
│                                      │ Integ. │         │            │
│                                      └────────┘    Trivy Scan       │
│                                                         │            │
│  ┌──────────────────────────────────────────────────────▼──────────┐│
│  │    CD : Load Image Minikube → kustomize edit → git push         ││
│  │         → argocd app sync → Artillery load tests                ││
│  └─────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
                            │ git push (manifest tags)
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           GITHUB                                      │
│         k8s/overlays/minikube/kustomization.yaml                     │
│         (image tag = BUILD_NUMBER)                                    │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ poll (3 min) ou webhook
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    MINIKUBE (cluster local)                           │
│                                                                       │
│  ┌─────────────┐  auto-sync   ┌──────────────────────────────────┐  │
│  │   ArgoCD    │ ────────────►│    namespace: collector-shop      │  │
│  │  :30080     │              │                                   │  │
│  │  GitOps CD  │              │  backend × 2  (HPA: 2→6)         │  │
│  └─────────────┘              │  frontend × 1 (HPA: 1→4)         │  │
│                               │  postgres, redis, minio           │  │
│  └─────────────┘              │  victoriametrics, grafana         │  │
│                               │  loki, promtail                   │  │
│  ┌──────────────┐             └──────────────────────────────────┘  │
│  │   Netdata    │◄──────────── streaming (Child DaemonSet/node)      │
│  │   Parent     │              CPU/RAM/réseau/cgroups/K8s/PG/Redis   │
│  │   :30199     │              100% local — pas d'API key requise    │
│  └──────────────┘                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage Rapide

### Prérequis

```bash
minikube version   # ≥ 1.30
kubectl version    # ≥ 1.28
docker version     # ≥ 24.0
argocd version     # ≥ 2.9
kustomize version  # ≥ 5.0
```

### Démarrage complet en une commande

```bash
make infra-up
```

Cette commande effectue dans l'ordre :
1. Démarre Minikube (6 GB RAM, 4 CPU, addons: metrics-server + ingress)
2. Build les images Docker dans le daemon Minikube
3. Déploie l'application via Kustomize (`k8s/overlays/minikube/`)
4. Installe et configure ArgoCD

---

## 🔷 ArgoCD — GitOps CD

### Installation manuelle

```bash
# Installer ArgoCD
make argocd-install

# Récupérer le mot de passe admin
make argocd-password

# Ouvrir l'interface web
make argocd-open
# URL : http://$(minikube ip):30080
# Login : admin / <mot de passe obtenu ci-dessus>
```

### Configuration des credentials Jenkins

Pour que Jenkins puisse déclencher les syncs ArgoCD, créer un token :

```bash
# 1. Se connecter à ArgoCD
argocd login $(minikube ip):30080 --insecure

# 2. Créer un token pour Jenkins
argocd proj role create-token collector-shop jenkins-ci

# 3. Ajouter le token dans Jenkins
# Jenkins > Credentials > Add > Secret Text
# ID : ARGOCD_TOKEN
# Value : <token généré>
```

### Flux GitOps

```
Jenkins build #N → kustomize edit set image backend=collector-shop-backend:N
                 → git commit "ci: deploy build N [skip ci]"
                 → git push origin main
                 → ArgoCD détecte le changement (poll 3 min)
                 → ArgoCD sync collector-shop
                 → kubectl apply k8s/overlays/minikube/
                 → Rolling update backend/frontend
                 → Health check OK → Déploiement terminé
```

### Commandes utiles

```bash
make argocd-status      # Statut de l'application
make argocd-sync        # Forcer une synchronisation
make argocd-history     # Historique des déploiements
make argocd-rollback REV=5   # Rollback vers la révision 5
```

### Structure des manifests ArgoCD

```
k8s/argocd/
├── namespace.yaml              # Namespace argocd
├── project.yaml                # AppProject collector-shop
├── application.yaml            # Application (pointe vers k8s/overlays/minikube)
└── jenkins-serviceaccount.yaml # ServiceAccount Jenkins pour les syncs
```

---

## 📊 Netdata — Monitoring (100% local)

### Avantages vs Datadog/Grafana

| Critère | Netdata | Datadog |
|---------|---------|---------|
| **Clé API requise** | ❌ Non | ✅ Oui |
| **Cloud requis** | ❌ Non (optionnel) | ✅ Oui |
| **Dashboard intégré** | ✅ Oui | ✅ Oui |
| **Autodiscovery K8s** | ✅ Oui | ✅ Oui |
| **Granularité** | 1 seconde | 10 secondes |
| **Coût** | Gratuit | Payant |

### Installation

```bash
# Aucune clé API requise — 100% local
make netdata-install

# Ouvrir le dashboard
make netdata-open
# URL : http://$(minikube ip):30199
```

### Architecture Parent / Child

```
Netdata Child (DaemonSet — un pod par node)
    └── collecte : CPU, mémoire, réseau, cgroups, PostgreSQL, Redis
    └── stream → Netdata Parent (Deployment)
                    └── dashboard central : http://<minikube ip>:30199
```

### Ce que Netdata monitore automatiquement

| Composant | Métriques collectées |
|-----------|---------------------|
| **Node Minikube** | CPU/cœur, mémoire, swap, réseau, disque I/O |
| **Conteneurs** | CPU, mémoire, réseau par conteneur (via cgroups) |
| **Kubernetes** | Pods status, deployments, HPA, events |
| **PostgreSQL** | Connexions, locks, tuples, query time |
| **Redis** | Hit rate, mémoire, commandes/sec, keyspace |
| **Alertes** | Pod not running, CPU > 80%, mémoire > 80% |

### Dashboards inclus (sans configuration)

- **System Overview** : CPU, mémoire, réseau du node
- **Kubernetes** : santé du cluster, pods, deployments
- **Applications** : métriques par conteneur/pod
- **PostgreSQL** : performances de la base de données
- **Redis** : métriques du cache

### Commandes utiles

```bash
make netdata-install    # Déploie Parent + DaemonSet children
make netdata-open       # Ouvre le dashboard dans le navigateur
make netdata-status     # Statut des pods (parent + children)
make netdata-logs       # Logs du parent en temps réel
make netdata-clean      # Supprime Netdata
```

### Structure Netdata

```
k8s/monitoring/netdata/
├── namespace.yaml      # Namespace monitoring
├── rbac.yaml           # ServiceAccount + ClusterRole + Binding
├── configmap.yaml      # Config parent (netdata.conf, stream.conf)
│                       # Config child  (stream vers parent, PG, Redis)
├── parent.yaml         # Deployment parent + Service NodePort :30199
├── daemonset.yaml      # DaemonSet child (un pod par node)
└── kustomization.yaml
```

---

## 🧪 Tests — CI + CD

### Tests CI (Jenkins, avant déploiement)

| Type | Outil | Commande | Résultat |
|------|-------|----------|---------|
| **Unitaires Backend** | Jest | `npm run test:coverage --workspace=backend` | Couverture HTML (Jenkins) |
| **Unitaires Frontend** | Jest + RTL | `npm run test:coverage --workspace=frontend` | Couverture HTML (Jenkins) |
| **Intégration** | Supertest + PostgreSQL | Inclus dans Jest (setup.ts) | Pass/Fail |
| **Sécurité** | Trivy | `trivy image collector-shop-backend:N` | 0 vuln. HIGH/CRITICAL |

### Tests de Charge CD (Artillery, post-déploiement Minikube)

**Déclenchement** : Stage Jenkins après `argocd app wait` (application Healthy)

```bash
# Cible : NodePort Minikube backend
http://$(minikube ip):30000

# Scénario : tests/load-tests/artillery.yml
# Configuration :
#   - phases: 0→10 users en 30s, puis 10 users pendant 60s
#   - Endpoints testés: GET /health, GET /api/announcements
```

**Résultats attendus** (SLO définis) :

| Métrique | SLO | Alerte |
|----------|-----|--------|
| P50 latence | < 100ms | > 150ms |
| P95 latence | < 200ms | > 300ms |
| P99 latence | < 300ms | > 500ms |
| Taux erreur | < 0.1% | > 0.5% |

**Rapport** : publié dans Jenkins (HTML + JSON archivé)

### Exécuter les tests manuellement

```bash
# Tests unitaires + intégration
make test

# Tests de charge uniquement
npx artillery run \
  --target http://$(minikube ip):30000 \
  tests/load-tests/artillery.yml

# Vérifier la couverture
make test-coverage
```

---

## 🔄 Pipeline Jenkins Complet

```
git push
    │
    ▼ (poll SCM)
[Stage 1] Checkout
    │
    ▼
[Stage 2] Installation des dépendances (npm install + prisma generate)
    │
    ▼
[Stage 3] Lint & Audit (ESLint backend + frontend + npm audit) ─ parallèle
    │
    ▼
[Stage 4] Build TypeScript (backend + frontend) ─ parallèle
    │
    ▼
[Stage 5] Tests Unitaires + Couverture (Jest, PostgreSQL éphémère) ─ parallèle
    │  └──► Rapport HTML coverage backend
    │  └──► Rapport HTML coverage frontend
    ▼
[Stage 6] Build Images Docker
    │  └──► collector-shop-backend:N + :latest
    │  └──► collector-shop-frontend:N + :latest
    ▼
[Stage 7] Scan Sécurité Trivy (séquentiel)
    │  └──► backend: 0 vuln HIGH/CRITICAL
    │  └──► frontend: 0 vuln HIGH/CRITICAL (--skip-db-update)
    ▼
[Stage 8] Load Images → Minikube (minikube image load)
    │
    ▼
[Stage 9] Mise à jour Manifests GitOps
    │  └──► kustomize edit set image backend=...:N
    │  └──► git commit + push → GitHub
    ▼
[Stage 10] Déploiement ArgoCD
    │  └──► argocd app sync collector-shop
    │  └──► argocd app wait --health --timeout=300
    ▼
[Stage 11] Tests de Charge Artillery
    │  └──► artillery run --target http://$(minikube ip):30000
    │  └──► Rapport HTML publié dans Jenkins
    │
    ▼
[POST] Nettoyage PostgreSQL + workspace
```

---

## 🏗️ Structure des Fichiers

```
k8s/
├── base/
│   ├── kustomization.yaml      ← NOUVEAU (ressources de base)
│   ├── hpa.yaml                ← NOUVEAU (HPA backend 2→6, frontend 1→4)
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── postgres.yaml + pv
│   ├── redis.yaml
│   ├── minio.yaml
│   ├── victoriametrics.yaml
│   ├── grafana.yaml
│   ├── loki.yaml
│   ├── promtail.yaml
│   └── namespace.yaml
├── overlays/
│   └── minikube/
│       └── kustomization.yaml  ← NOUVEAU (image tags + patches Minikube)
├── argocd/
│   ├── namespace.yaml          ← NOUVEAU
│   ├── project.yaml            ← NOUVEAU (AppProject)
│   ├── application.yaml        ← NOUVEAU (Application auto-sync)
│   └── jenkins-serviceaccount.yaml ← NOUVEAU
└── monitoring/
    └── netdata/
        ├── namespace.yaml      ← NOUVEAU
        ├── rbac.yaml           ← NOUVEAU (ClusterRole + Binding)
        ├── configmap.yaml      ← NOUVEAU (config parent + child + intégrations PG/Redis)
        ├── parent.yaml         ← NOUVEAU (Deployment parent + NodePort :30199)
        ├── daemonset.yaml      ← NOUVEAU (DaemonSet child par node)
        └── kustomization.yaml  ← NOUVEAU
```

---

## 🔑 Credentials Jenkins à Configurer

Ajouter dans **Jenkins > Credentials > Global > Add Credentials** :

| ID Jenkins | Type | Description |
|------------|------|-------------|
| `GITHUB_TOKEN` | Secret Text | Token GitHub (scope: `repo`) pour git push des manifests |
| `ARGOCD_TOKEN` | Secret Text | Token ArgoCD du projet `collector-shop` |
| `KUBECONFIG_B64` | Secret Text | `cat ~/.kube/config | base64 -w0` (accès Minikube) |

---

## 🎯 Commandes de Référence

```bash
# Infrastructure complète
make infra-up          # Lance tout (Minikube + ArgoCD + App)
make infra-status      # Statut complet
make infra-down        # Arrête tout

# ArgoCD
make argocd-install    # Installe ArgoCD
make argocd-password   # Mot de passe admin
make argocd-open       # Ouvre l'UI dans le navigateur
make argocd-sync       # Force une synchronisation
make argocd-history    # Historique des déploiements

# Netdata (pas de clé API requise)
make netdata-install   # Déploie Parent + DaemonSet
make netdata-open      # Ouvre le dashboard (http://<minikube ip>:30199)
make netdata-status    # Statut des pods
make netdata-logs      # Logs en temps réel
make netdata-clean     # Supprime Netdata

# Jenkins
make jenkins-start     # Démarre Jenkins (http://localhost:8080)
make jenkins-logs      # Logs en temps réel
```

---

*Document généré le 17 mars 2026 — Collector.shop v1*
