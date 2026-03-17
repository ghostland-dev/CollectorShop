# 🏗️ Infrastructure Minikube — ArgoCD + Netdata + Jenkins + Gitea

**Projet** : Collector.shop — Plateforme de vente d'objets de collection  
**Date** : Mars 2026  
**Stack** : Minikube · Gitea (Git local) · ArgoCD (GitOps CD) · Jenkins (CI/CD) · Netdata (Monitoring) · HTTPS (Nginx Ingress + TLS)

---

## 📐 Architecture Globale

```
┌──────────────────────────────────────────────────────────────────────┐
│                          DÉVELOPPEUR                                  │
│                    git push → Gitea (local)                          │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ SCM webhook / poll (2 min)
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                 JENKINS  http://jenkins.shopcollector.local:8080      │
│  ┌──────────┐ ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────────────┐  │
│  │ Checkout │→│ Lint │→│ Build TS │→│ Tests  │→│ Docker Build   │  │
│  └──────────┘ └──────┘ └──────────┘ │ Unit   │ └────────────────┘  │
│                                      │ Integ. │         │            │
│                                      └────────┘    Trivy Scan       │
│                                                         │            │
│  ┌──────────────────────────────────────────────────────▼──────────┐│
│  │  CD : Load Image Minikube → kustomize edit → git push Gitea     ││
│  │       → argocd app sync → Artillery load tests                  ││
│  └─────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
                            │ git push (manifest tags)
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│          GITEA  http://gitea.shopcollector.local:31200               │
│          repo : gitea-admin/collector-shop                            │
│          k8s/overlays/minikube/kustomization.yaml (image tag = N)    │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ poll (3 min) ou webhook
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    MINIKUBE (cluster local)                           │
│                                                                       │
│  ┌─────────────┐  auto-sync   ┌──────────────────────────────────┐  │
│  │   ArgoCD    │─────────────►│    namespace: collector-shop      │  │
│  │  :31080     │              │                                   │  │
│  │  GitOps CD  │              │  backend  × 2  (HPA: 2→6)        │  │
│  └─────────────┘              │  frontend × 2  (HPA: 1→4)        │  │
│                               │  postgres, redis, minio           │  │
│  ┌─────────────┐              │  victoriametrics, grafana         │  │
│  │   Gitea     │              │  loki, promtail                   │  │
│  │  :31200     │              └──────────────────────────────────┘  │
│  │ (namespace  │                          │                          │
│  │  gitea)     │              ┌───────────▼──────────────────────┐  │
│  └─────────────┘              │  Nginx Ingress (HTTPS :32390)    │  │
│                               │  *.shopcollector.local  TLS/SNI  │  │
│  ┌──────────────┐             └──────────────────────────────────┘  │
│  │   Netdata    │◄─────────── streaming (Child DaemonSet/node)       │
│  │   Parent     │             CPU/RAM/réseau/cgroups/K8s/PG/Redis    │
│  │  :30199      │             100% local — pas d'API key requise     │
│  └──────────────┘                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 URLs & Accès (HTTPS)

> Tous les alias sont définis dans `/etc/hosts` → `192.168.49.2` (IP Minikube).  
> Accès HTTPS standard (port 443) via proxy nginx + iptables DNAT.

| Service | URL HTTPS | Identifiants |
|---------|-----------|--------------|
| **Frontend (prod)** | `https://shopcollector.local` | — |
| **Backend API (prod)** | `https://api.shopcollector.local` | — |
| **Grafana** | `https://grafana.shopcollector.local` | `admin / admin` |
| **ArgoCD** | `https://argocd.shopcollector.local` | `admin / OUo-HzdTSjWpv0vt` |
| **Gitea** | `https://gitea.shopcollector.local` | `gitea-admin / gitea-admin-2026` |
| **Jenkins** | `http://jenkins.shopcollector.local:8080` | `admin / admin` |
| **Netdata** | `https://netdata.shopcollector.local` | — |
| **SonarCloud** | `https://sonarcloud.io/project/overview?id=goodfood-apps_collector-shop` | — |

### Environnements (3 apps ArgoCD)

| Environnement | Namespace | Frontend | API | ArgoCD App |
|---------------|-----------|----------|-----|------------|
| **Production** | `collector-shop` | `https://shopcollector.local` | `https://api.shopcollector.local` | `collector-shop-production` |
| **Staging** | `collector-shop-staging` | `https://staging.shopcollector.local` | `https://api-staging.shopcollector.local` | `collector-shop-staging` |
| **Dev** | `collector-shop-dev` | `https://dev.shopcollector.local` | `https://api-dev.shopcollector.local` | `collector-shop-dev` |

> Pour staging et dev, ajouter dans `/etc/hosts` :
> ```
> 192.168.49.2 dev.shopcollector.local api-dev.shopcollector.local grafana-dev.shopcollector.local
> 192.168.49.2 staging.shopcollector.local api-staging.shopcollector.local grafana-staging.shopcollector.local
> ```

### Comptes de test (seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@collector.shop` | `password123` |
| **Vendeur 1** | `vendeur1@collector.shop` | `password123` |
| **Vendeur 2** | `vendeur2@collector.shop` | `password123` |
| **Vendeur 3** | `vendeur3@collector.shop` | `password123` |
| **Acheteur 1** | `acheteur1@collector.shop` | `password123` |
| **Acheteur 2** | `acheteur2@collector.shop` | `password123` |

---

## 🔒 HTTPS — Nginx Ingress + TLS

### Certificat auto-signé (wildcard `*.shopcollector.local`)

```bash
# Généré avec openssl — valide 365 jours
# SAN : shopcollector.local, *.shopcollector.local,
#        api.shopcollector.local, grafana.shopcollector.local,
#        argocd.shopcollector.local, netdata.shopcollector.local

# Secret Kubernetes
kubectl get secret shopcollector-tls -n collector-shop
```

### Accès HTTPS (port 443 standard)

Un proxy nginx sur l'hôte écoute sur le port 443 et redirige vers l'Ingress Minikube (NodePort 32390).  
Les règles iptables DNAT redirigent `192.168.49.2:443` → `127.0.0.1:443`.

| Protocole | Port | Rôle |
|-----------|------|------|
| HTTPS | `443` | Accès standard (shopcollector.local, api.shopcollector.local, etc.) |
| HTTP | `80` | Redirection 308 → HTTPS |

### Règles Ingress

```
https://shopcollector.local       → service/frontend:80 (prod)
https://api.shopcollector.local    → service/backend:5000 (prod)
https://grafana.shopcollector.local → service/grafana:3000
https://dev.shopcollector.local    → frontend (namespace collector-shop-dev)
https://staging.shopcollector.local → frontend (namespace collector-shop-staging)
```

> Certificat mkcert (wildcard `*.shopcollector.local`) — exécuter `mkcert -install` pour faire confiance au CA.

---

## 🐙 Gitea — Serveur Git Local

Gitea remplace GitHub pour le flux CI/CD local. ArgoCD polle directement Gitea depuis l'intérieur du cluster.

### Pourquoi Gitea ?

- Accessible depuis les pods Minikube sans firewall (même réseau cluster)
- Interface web complète (Pull Requests, webhooks, tags)
- Léger (~50 MB RAM)
- ArgoCD support natif via `http://gitea.gitea.svc.cluster.local:3000`

### Repository

```
URL interne (ArgoCD) : http://gitea.gitea.svc.cluster.local:3000/gitea-admin/collector-shop.git
URL externe (navigateur) : http://gitea.shopcollector.local:31200/gitea-admin/collector-shop
Branche principale : main
```

### Pousser du code vers Gitea

```bash
# Ajouter Gitea comme remote
git remote add gitea http://gitea-admin:gitea-admin-2026@$(minikube ip):31200/gitea-admin/collector-shop.git

# Pousser
git push gitea main
```

### Structure namespace Gitea

```
namespace: gitea
├── Deployment/gitea        (image: gitea/gitea:1.21-rootless)
├── Service/gitea           (NodePort :31200 HTTP, :31022 SSH)
└── PersistentVolumeClaim   (2Gi — données Gitea + repos)
```

---

## 🚀 Démarrage Rapide

### Prérequis

```bash
minikube version   # ≥ 1.30
kubectl version    # ≥ 1.28
docker version     # ≥ 24.0
```

### Démarrage complet

```bash
# 1. Infrastructure Minikube + ArgoCD + App
make infra-up

# 2. Gitea (serveur Git local)
kubectl apply -f /tmp/gitea.yaml   # ou make gitea-install si disponible

# 3. Jenkins
make jenkins-start

# 4. Netdata (monitoring — optionnel)
make netdata-install

# 5. Seed des données de démonstration
make seed   # ou : cd backend && DATABASE_URL=... npm run prisma:seed
```

### /etc/hosts requis

```bash
sudo bash -c '
# Minikube IP (vérifier avec : minikube ip)
echo "192.168.49.2  shopcollector.local api.shopcollector.local grafana.shopcollector.local argocd.shopcollector.local gitea.shopcollector.local netdata.shopcollector.local" >> /etc/hosts

# Jenkins (hôte local)
echo "127.0.0.1  jenkins.shopcollector.local" >> /etc/hosts
'
```

---

## 🔷 ArgoCD — GitOps CD

### Configuration actuelle

```
Namespace  : argocd
NodePort   : 31080 (HTTP), 31443 (HTTPS)
Alias      : http://argocd.shopcollector.local:31080
Login      : admin / OUo-HzdTSjWpv0vt
Repo source: http://gitea.gitea.svc.cluster.local:3000/gitea-admin/collector-shop.git
Path       : k8s/overlays/minikube
Auto-sync  : ✅ activé (prune + selfHeal)
```

### Récupérer le mot de passe admin

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

### Flux GitOps

```
Jenkins build #N
    │
    ├── kustomize edit set image backend=collector-shop-backend:N
    ├── git commit "ci: deploy build N [skip ci]"
    └── git push gitea main
                │
                ▼ (poll 3 min)
    ArgoCD détecte le changement dans Gitea
                │
                ▼
    argocd app sync collector-shop
                │
                ▼
    kubectl apply -k k8s/overlays/minikube/
                │
                ▼
    Rolling update backend/frontend → Health OK ✅
```

### Commandes utiles

```bash
make argocd-status          # Statut de l'application
make argocd-sync            # Forcer une synchronisation
make argocd-history         # Historique des déploiements
make argocd-rollback REV=5  # Rollback vers la révision 5
make argocd-password        # Afficher le mot de passe admin
make argocd-open            # Ouvrir l'UI dans le navigateur
```

### Structure des manifests ArgoCD

```
k8s/argocd/
├── namespace.yaml              # Namespace argocd
├── project.yaml                # AppProject collector-shop (namespaces dev/staging/prod autorisés)
├── applications.yaml           # 3 Applications (dev, staging, production) — auto-sync Gitea
└── jenkins-serviceaccount.yaml # ServiceAccount Jenkins pour les syncs
```

### Applications ArgoCD (3 environnements)

| Application | Overlay | Namespace | Rôle |
|-------------|---------|-----------|------|
| `collector-shop-dev` | `k8s/overlays/dev` | `collector-shop-dev` | Développement (1 replica) |
| `collector-shop-staging` | `k8s/overlays/staging` | `collector-shop-staging` | Pré-production (2 replicas) |
| `collector-shop-production` | `k8s/overlays/minikube` | `collector-shop` | Production (HPA 2→6) |

---

## 🔧 Jenkins — CI/CD

### Configuration actuelle

```
Conteneur  : collector-shop-jenkins (docker-compose)
Port       : 8080
Alias      : http://jenkins.shopcollector.local:8080
Login      : admin / admin
Config     : JCasC (jenkins/casc.yaml)
Outils     : Node.js 20, Docker CLI, Trivy, kubectl, kustomize, ArgoCD CLI
```

### Démarrage

```bash
make jenkins-start   # Build + start
make jenkins-logs    # Logs en temps réel
make jenkins-open    # Ouvre l'UI dans le navigateur
```

### Credentials à configurer dans Jenkins

Ajouter dans **Jenkins > Credentials > Global > Add Credentials** :

| ID | Type | Description |
|----|------|-------------|
| `GITHUB_TOKEN` | Secret Text | Token Gitea ou GitHub pour git push des manifests |
| `ARGOCD_TOKEN` | Secret Text | Token ArgoCD du projet `collector-shop` |
| `KUBECONFIG_B64` | Secret Text | `cat ~/.kube/config \| base64 -w0` (accès Minikube) |

### Créer le token ArgoCD pour Jenkins

```bash
# Se connecter à ArgoCD
argocd login argocd.shopcollector.local:31080 --insecure

# Créer un token pour le rôle jenkins-ci
argocd proj role create-token collector-shop jenkins-ci

# Ajouter dans Jenkins > Credentials : ID = ARGOCD_TOKEN
```

---

## 🧪 Tests

### Pipeline CI (Jenkins)

| Type | Outil | Résultat |
|------|-------|---------|
| **Unitaires Backend** | Jest + ts-jest | Couverture HTML publiée Jenkins |
| **Unitaires Frontend** | Jest + React Testing Library | Couverture HTML publiée Jenkins |
| **Intégration** | Supertest + PostgreSQL éphémère | Pass/Fail bloque le merge |
| **Sécurité** | Trivy | 0 vuln. HIGH/CRITICAL requis |

### Tests de Charge CD (Artillery, post-déploiement)

**Cible** : `http://$(minikube ip):31000` (NodePort backend)

| Métrique | SLO | Alerte |
|----------|-----|--------|
| P50 latence | < 100ms | > 150ms |
| P95 latence | < 200ms | > 300ms |
| P99 latence | < 300ms | > 500ms |
| Taux erreur | < 0.1% | > 0.5% |

```bash
# Lancer manuellement
npx artillery run \
  --target http://$(minikube ip):31000 \
  tests/load-tests/artillery.yml
```

---

## 📊 Netdata — Monitoring

### Architecture Parent / Child

```
Netdata Child (DaemonSet — un pod par node Minikube)
    └── collecte : CPU, mémoire, réseau, cgroups, PostgreSQL, Redis
    └── stream → Netdata Parent (Deployment)
                    └── dashboard : http://netdata.shopcollector.local:30199
```

### Ce que Netdata monitore

| Composant | Métriques |
|-----------|-----------|
| Node Minikube | CPU/cœur, mémoire, swap, réseau, disque I/O |
| Conteneurs | CPU, mémoire, réseau par conteneur (cgroups) |
| Kubernetes | Pods, deployments, HPA, events |
| PostgreSQL | Connexions, locks, tuples, query time |
| Redis | Hit rate, mémoire, commandes/sec |

```bash
make netdata-install   # Déploie Parent + DaemonSet
make netdata-open      # Ouvre le dashboard
make netdata-status    # Statut des pods
make netdata-logs      # Logs parent en temps réel
make netdata-clean     # Supprime Netdata
```

---

## 🏗️ Structure des Fichiers Kubernetes

```
k8s/
├── base/
│   ├── kustomization.yaml      # Ressources de base + tls-secret + ingress
│   ├── namespace.yaml
│   ├── backend.yaml            # Deployment + Service NodePort :31000
│   ├── frontend.yaml           # Deployment + Service NodePort :31001
│   ├── postgres.yaml + pv
│   ├── redis.yaml
│   ├── minio.yaml
│   ├── victoriametrics.yaml
│   ├── grafana.yaml            # Service NodePort :31300 (securityContext fix)
│   ├── loki.yaml
│   ├── promtail.yaml
│   ├── hpa.yaml                # HPA backend 2→6, frontend 1→4
│   ├── tls-secret.yaml         # Certificat TLS wildcard *.shopcollector.local
│   └── ingress.yaml            # Ingress HTTPS (ssl-redirect, CORS)
├── overlays/
│   └── minikube/
│       └── kustomization.yaml  # image tags (mis à jour par Jenkins) + imagePullPolicy: Never
├── argocd/
│   ├── namespace.yaml
│   ├── project.yaml            # AppProject (Gitea + GitHub autorisés)
│   ├── applications.yaml       # 3 Applications (dev, staging, production)
│   └── jenkins-serviceaccount.yaml
└── monitoring/
    └── netdata/
        ├── namespace.yaml
        ├── rbac.yaml
        ├── configmap.yaml      # Config parent + child + intégrations PG/Redis
        ├── parent.yaml         # Deployment + Service NodePort :30199
        ├── daemonset.yaml      # DaemonSet child (un pod par node)
        └── kustomization.yaml
```

---

## 🔄 Pipeline Jenkins Complet

```
git push → Gitea
    │
    ▼ (poll SCM 2 min)
[Stage 1]  Checkout
[Stage 2]  Install (npm install + prisma generate)
[Stage 3]  Lint & Audit (ESLint ×3 + npm audit) — parallèle
[Stage 4]  Build TypeScript (backend + frontend) — parallèle
[Stage 5]  Tests Unitaires + Intégration (Jest + PostgreSQL éphémère)
           └── Rapport HTML coverage backend + frontend
[Stage 6]  Build Images Docker
           └── collector-shop-backend:N + :latest
           └── collector-shop-frontend:N + :latest
[Stage 7]  Scan Trivy (HIGH/CRITICAL bloquant)
[Stage 8]  Load Images → Minikube (imagePullPolicy: Never)
[Stage 9]  Mise à jour Manifests GitOps
           └── kustomize edit set image → backend:N / frontend:N
           └── git commit + push → Gitea
[Stage 10] Déploiement ArgoCD
           └── argocd app sync collector-shop-production
           └── argocd app wait --health --timeout=300
[Stage 11] Tests de Charge Artillery (post-déploiement)
           └── target: http://$(minikube ip):31000
           └── Rapport HTML + JSON archivé dans Jenkins
[POST]     Nettoyage PostgreSQL + workspace
```

---

## 🎯 Commandes de Référence Makefile

```bash
# ── Infrastructure complète ──────────────────────────────────────────
make infra-up          # Minikube + images Docker + Kustomize + ArgoCD
make infra-status      # Statut complet (pods, HPA, URLs)
make infra-down        # Arrête tout

# ── ArgoCD ───────────────────────────────────────────────────────────
make argocd-install    # Installe ArgoCD en NodePort 31080
make argocd-password   # Mot de passe admin
make argocd-open       # Ouvre https://argocd.shopcollector.local
make argocd-sync       # Force une synchronisation
make argocd-history    # Historique des déploiements
make argocd-rollback REV=N  # Rollback vers la révision N

# ── Jenkins ───────────────────────────────────────────────────────────
make jenkins-start     # Démarre Jenkins (http://jenkins.shopcollector.local:8080)
make jenkins-stop      # Arrête Jenkins
make jenkins-logs      # Logs en temps réel
make jenkins-open      # Ouvre l'UI

# ── Kubernetes ────────────────────────────────────────────────────────
make k8s-start         # Démarre Minikube
make k8s-status        # Statut des pods
make k8s-logs          # Logs des pods
make k8s-urls          # Affiche toutes les URLs

# ── Netdata ───────────────────────────────────────────────────────────
make netdata-install   # Déploie Parent + DaemonSet
make netdata-open      # Ouvre https://netdata.shopcollector.local
make netdata-status    # Statut pods (parent + children)
make netdata-logs      # Logs du parent en temps réel
make netdata-clean     # Supprime Netdata

# ── Application ───────────────────────────────────────────────────────
make seed              # Injecte les données de démonstration
make test              # Lance les tests unitaires + intégration
make lint              # ESLint backend + frontend
```

---

## 🗺️ Ports NodePort — Récapitulatif

| Service | NodePort | Alias |
|---------|----------|-------|
| Backend | `31000` | `api.shopcollector.local:31000` |
| Frontend | `31001` | `shopcollector.local:31001` |
| Grafana | `31300` | `grafana.shopcollector.local:31300` |
| ArgoCD HTTP | `31080` | `argocd.shopcollector.local:31080` |
| ArgoCD HTTPS | `31443` | `argocd.shopcollector.local:31443` |
| Gitea HTTP | `31200` | `gitea.shopcollector.local:31200` |
| Gitea SSH | `31022` | `gitea.shopcollector.local:31022` |
| Netdata | `30199` | `netdata.shopcollector.local:30199` |
| Ingress HTTP | `32460` | *(redirigé → HTTPS)* |
| Ingress HTTPS | `32390` | `*.shopcollector.local:32390` |
| Jenkins (hôte) | `8080` | `jenkins.shopcollector.local:8080` |

---

*Document mis à jour le 17 mars 2026 — Collector.shop v1.1*
