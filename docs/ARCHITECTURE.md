# Architecture Technique — Collector.shop

**Date** : 18 mars 2026
**Projet** : Collector.shop — Marketplace de cartes Pokémon rares
**Stack** : TypeScript fullstack · Kubernetes · Jenkins CI/CD · ArgoCD GitOps

---

## 1. INFRASTRUCTURE GLOBALE (Vue bout en bout)

```mermaid
graph TB
    DEV["🖥️ Développeur\ngit push"]

    subgraph GITEA_EXT["📦 Gitea — gitea.shopcollector.local:31200"]
        REPO["repo: gitea-admin/collector-shop\nCode source + Manifests K8s"]
    end

    subgraph JENKINS_BOX["⚙️ Jenkins — jenkins.shopcollector.local:8080"]
        direction LR
        JCI["Pipeline CI/CD\n8 stages · 21 jobs parallèles"]
    end

    subgraph EXTERNAL["🌐 Services Externes"]
        SONAR["SonarCloud\nSAST / Code Quality"]
        DISCORD["Discord\nNotifications webhook"]
    end

    subgraph MINIKUBE["☸️ Minikube Cluster (192.168.49.2)"]
        direction TB

        subgraph INGRESS_BOX["🔒 Nginx Ingress + TLS wildcard (*.shopcollector.local)"]
            ING["HTTPS :443\nHTTP :80 → 308 redirect"]
        end

        subgraph ARGO_BOX["ArgoCD — argocd.shopcollector.local"]
            ARGO["GitOps Sync\npoll Gitea toutes les 3 min\n3 apps: prod / staging / dev"]
        end

        subgraph GITEA_BOX["Gitea (namespace: gitea)"]
            GT["gitea:31200\nGit server local\nArgoCD source of truth"]
        end

        subgraph APP["namespace: collector-shop (Production)"]
            direction TB

            subgraph FE_BOX["Frontend (HPA 1→4)"]
                FE1["frontend-pod-1\nReact 18 + Nginx"]
                FE2["frontend-pod-2\nReact 18 + Nginx"]
            end

            subgraph BE_BOX["Backend (HPA 2→6)"]
                BE1["backend-pod-1\nNode.js 20 / Express"]
                BE2["backend-pod-2\nNode.js 20 / Express"]
            end

            subgraph DATA_BOX["Data Layer"]
                PG["PostgreSQL 15\nPrisma ORM\n:5432"]
                RD["Redis 7\nCache + Rate Limit\n:6379"]
                MN["MinIO\nS3 Storage\n:9000"]
            end

            subgraph OBS_BOX["Observabilité"]
                VM["VictoriaMetrics\nTime-series DB\n:8428"]
                GF["Grafana\nDashboards + Alerts\n:3000"]
                LK["Loki\nLog Aggregation\n:3100"]
                PT["Promtail\nLog Collector\nDaemonSet"]
            end
        end

        subgraph NETDATA_BOX["Netdata Monitoring"]
            NTP["Netdata Parent\n:30199\nCPU/RAM/K8s/PG/Redis"]
            NTC["Netdata Children\nDaemonSet (1/node)\nStreaming → Parent"]
        end
    end

    DEV -->|"git push main/staging/develop"| REPO
    REPO -->|"SCM webhook / poll 2 min"| JCI
    JCI -->|"SAST scan"| SONAR
    JCI -->|"success/failure/unstable"| DISCORD
    JCI -->|"kustomize edit set image\ngit push manifest"| GT
    GT -->|"poll 3 min"| ARGO
    ARGO -->|"kubectl apply"| APP
    ING -->|"shopcollector.local"| FE1
    ING -->|"api.shopcollector.local"| BE1
    BE1 --> PG
    BE1 --> RD
    BE1 --> MN
    BE1 -->|"push metrics"| VM
    VM --> GF
    PT -->|"scrape logs"| LK
    LK --> GF
    NTC -->|"streaming"| NTP

    style DEV fill:#334155,stroke:#64748b,color:#f1f5f9
    style REPO fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style JCI fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style SONAR fill:#1e293b,stroke:#f59e0b,color:#fcd34d
    style DISCORD fill:#1e1b4b,stroke:#818cf8,color:#c7d2fe
    style ARGO fill:#2d1b69,stroke:#a855f7,color:#d8b4fe
    style GT fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style ING fill:#1c3a2e,stroke:#10b981,color:#6ee7b7
    style PG fill:#1e3a5f,stroke:#60a5fa,color:#bfdbfe
    style RD fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style MN fill:#3b1a2e,stroke:#ec4899,color:#fbcfe8
    style VM fill:#3b2000,stroke:#f97316,color:#fdba74
    style GF fill:#3b2000,stroke:#f59e0b,color:#fde68a
    style LK fill:#1a2e1a,stroke:#4ade80,color:#bbf7d0
    style NTP fill:#1e293b,stroke:#94a3b8,color:#e2e8f0
```

---

## 2. PIPELINE CI/CD JENKINS (8 stages en parallèle)

```mermaid
graph TB
    START(["🚀 git push\nmain / staging / develop"])

    START --> S1

    subgraph S1["Stage 1 — Checkout & Installation"]
        direction LR
        S1A["checkout scm"]
        S1B["npm install (workspaces)"]
        S1C["prisma generate"]
        S1A --> S1B --> S1C
    end

    S1 --> S2

    subgraph S2["Stage 2 — Lint → Qualité → Compilation (PARALLÈLE)"]
        direction LR
        S2A["Lint Backend\nESLint TypeScript"]
        S2B["Lint Frontend\nESLint React/TSX"]
        S2C["Qualité npm\nnpm audit + license-checker"]
        S2D["SonarCloud\nSAST · Code Smells · Coverage"]
        S2E["Compilation Backend\ntsc"]
        S2F["Compilation Frontend\ntsc + vite build"]
    end

    S2 --> S3

    subgraph S3["Stage 3 — Tests Unitaires (PARALLÈLE)"]
        direction LR
        subgraph BACKEND_TRACK["Branche A — Backend"]
            S3A1["Démarrage PostgreSQL\néphémère :15432\nprisma db push"]
            S3A2["Jest Backend\n18 tests · 82% coverage\nJUnit XML + HTML"]
            S3A1 --> S3A2
        end
        subgraph FRONTEND_TRACK["Branche B — Frontend"]
            S3B1["Jest Frontend\n2 tests · jsdom\nJUnit XML + HTML"]
        end
    end

    S3 --> S4

    subgraph S4["Stage 4 — Analyse Sécurité (PARALLÈLE)"]
        direction LR
        S4A["Trivy Filesystem\nvuln + secret scan\n--severity HIGH,CRITICAL"]
        S4B["npm audit strict\n--audit-level=critical"]
    end

    S4 --> S5

    subgraph S5["Stage 5 — Build Docker (PARALLÈLE)"]
        direction LR
        S5A["Build Backend\ndocker build\n-f backend/Dockerfile"]
        S5B["Build Frontend\ndocker build\n-f frontend/Dockerfile"]
        S5C["Scan Trivy Images\nbackend + frontend"]
        S5D["Load → Minikube\ndocker save | docker load\n--tls minikube daemon"]
        S5A --> S5C
        S5B --> S5C
        S5C --> S5D
    end

    S5 --> S6

    subgraph S6["Stage 6 — ArgoCD GitOps"]
        direction LR
        S6A["kustomize edit set image\nBUILD_NUMBER tag"]
        S6B["git push → Gitea\nmanifest branch"]
        S6C["REST API ArgoCD sync\nPolling Synced+Healthy\nmax 5 min"]
        S6A --> S6B --> S6C
    end

    S6 --> S7

    subgraph S7["Stage 7 — Tests de Charge & Intégration (PARALLÈLE)"]
        direction LR
        S7A["Smoke Tests\ncurl health · api · frontend\nattente services live"]
        S7B["Artillery Load Tests\nP95 < 500ms\nerror rate < 5%\nrapport HTML archivé"]
    end

    S7 --> S8

    subgraph S8["Post — Notifications Discord"]
        direction LR
        S8A["SUCCESS\nvert + liens app/grafana/argocd"]
        S8B["FAILURE\nrouge + lien logs Jenkins"]
        S8C["UNSTABLE\njaune + métriques"]
    end

    S8POST(["🏁 Fin + cleanWs\ndocker rm postgres"])
    S8 --> S8POST

    style START fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style S2A fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style S2B fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style S2D fill:#1e293b,stroke:#f59e0b,color:#fcd34d
    style S3A2 fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style S3B1 fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style S4A fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style S4B fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style S5C fill:#3b1515,stroke:#f97316,color:#fdba74
    style S6C fill:#2d1b69,stroke:#a855f7,color:#d8b4fe
    style S8A fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style S8B fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style S8C fill:#3b2800,stroke:#f59e0b,color:#fde68a
```

---

## 3. STACK APPLICATIF V1 (Monolithe modulaire)

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer"]
        BROWSER["Browser / Mobile"]
    end

    subgraph FRONTEND["🎨 Frontend — React 18 + TypeScript"]
        direction TB
        PAGES["Pages (13)\nHomePage · CatalogPage · AnnouncementDetail\nCreateAnnouncement · EditAnnouncement\nMyAnnouncements · MyPurchases\nCheckout · CartPage · ChatPage\nLoginPage · RegisterPage · PaymentSuccess"]
        STORE["State Management\nZustand (auth)\nReact Query (server state)"]
        I18N["Internationalisation\nreact-i18next\nfr / en"]
        UI["Material-UI v5\nThème dark · ARIA · a11y WCAG 2.1"]
        PAGES --- STORE --- I18N --- UI
    end

    subgraph BACKEND["⚙️ Backend — Node.js 20 + Express + TypeScript"]
        direction TB

        subgraph MIDDLEWARE["Middleware Stack (ordre d'exécution)"]
            direction LR
            MW1["Helmet.js\nCSP · HSTS\nX-Frame-Options"]
            MW2["CORS\norigin strict"]
            MW3["Rate Limiter\n100 req/15min/IP\nRedis store"]
            MW4["JWT Auth\nHS256 · 15min/7j"]
            MW5["RBAC\nBUYER · SELLER\nADMIN"]
            MW6["Zod Validation\ninput sanitization"]
            MW1 --> MW2 --> MW3 --> MW4 --> MW5 --> MW6
        end

        subgraph ROUTES["API Routes (6)"]
            R1["/api/auth\nregister · login · me · refresh"]
            R2["/api/announcements\nCRUD · search · filter · paginate"]
            R3["/api/purchases\ncreate · me · sales · delivery-status"]
            R4["/api/chat\nconversations · messages"]
            R5["/api/upload\nimage · images (MinIO)"]
            R6["/api/shop\nshop · collections"]
        end

        subgraph SERVICES["Business Services (6)"]
            SV1["Fraud Detection\nauto-buy · duplicate\npattern · risk score 0-100\nACTION: ALLOW/REVIEW/BLOCK"]
            SV2["Moderation\nspam keywords · price anomaly\nduplicate detect · score ≥50 → reject"]
            SV3["Payment\nStripe-ready structure\nPurchase state machine"]
            SV4["MinIO\nimage upload · presigned URLs\nbucket: collector-shop-images"]
            SV5["Metrics\nPrometheus counters\nHTTP latency · DB queries · errors"]
            SV6["VictoriaMetrics\npush metrics every 15s\nremote-write endpoint"]
        end

        subgraph UTILS["Utilitaires"]
            U1["audit-logger.ts\nWinston JSON · OWASP-compliant\nACTION · USER · RESOURCE · IP"]
            U2["auth.ts\nbcrypt rounds=12\nJWT sign/verify"]
        end
    end

    subgraph DATA["💾 Data Layer"]
        PG["PostgreSQL 15\nPrisma ORM 5.x\nMigrations automatiques\nSchéma: User·Announcement\nPurchase·Conversation·Message\nShop·Collection·CollectionItem"]
        RD["Redis 7\nrate-limit store\nsession cache\nP95=120ms avec cache"]
        MN["MinIO\nS3-compatible\nbucket public read\nimages Pexels (seed)"]
    end

    subgraph OBSERVABILITY["📊 Observabilité (3 piliers)"]
        direction LR
        VM["VictoriaMetrics\ntime-series\nP50·P95·P99\n833 req/s"]
        GF["Grafana\ndashboard JSON\nalerting\nP95 seuil 200ms"]
        LK["Loki\nlog aggregation\nLogQL queries"]
        PT["Promtail\nDaemonSet\nlog scraping"]
        VM --> GF
        PT --> LK --> GF
    end

    BROWSER -->|"HTTPS / REST JSON"| FRONTEND
    FRONTEND -->|"JWT Bearer"| BACKEND
    BACKEND --> PG
    BACKEND --> RD
    BACKEND --> MN
    BACKEND -->|"push metrics"| VM
    BACKEND -->|"Winston logs"| PT

    style BROWSER fill:#334155,stroke:#64748b,color:#f1f5f9
    style MW1 fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style MW4 fill:#3b1515,stroke:#f97316,color:#fdba74
    style MW5 fill:#3b1515,stroke:#f59e0b,color:#fde68a
    style SV1 fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style SV2 fill:#3b1515,stroke:#f97316,color:#fdba74
    style PG fill:#1e3a5f,stroke:#60a5fa,color:#bfdbfe
    style RD fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style MN fill:#3b1a2e,stroke:#ec4899,color:#fbcfe8
    style VM fill:#3b2000,stroke:#f97316,color:#fdba74
    style GF fill:#3b2000,stroke:#f59e0b,color:#fde68a
    style LK fill:#1a2e1a,stroke:#4ade80,color:#bbf7d0
```

---

## 4. KUBERNETES — NAMESPACES ET PODS

```mermaid
graph TB
    subgraph CLUSTER["☸️ Minikube Cluster — 192.168.49.2"]
        direction TB

        subgraph INGRESS_NS["Nginx Ingress Controller"]
            ING["Ingress Rules\nhttps://shopcollector.local → frontend:80\nhttps://api.shopcollector.local → backend:5000\nhttps://grafana.shopcollector.local → grafana:3000\nhttps://argocd.shopcollector.local → argocd:80\nhttps://netdata.shopcollector.local → netdata:19999"]
        end

        subgraph NS_PROD["namespace: collector-shop (Production)"]
            direction TB

            subgraph DEPLOY_FE["Deployment/frontend — HPA 1→4 replicas"]
                FE1["Pod: frontend-xxx-1\nImage: collector-shop-frontend:N\nnginx:alpine\nPort: 80"]
                FE2["Pod: frontend-xxx-2\nImage: collector-shop-frontend:N\nnginx:alpine\nPort: 80"]
            end

            subgraph DEPLOY_BE["Deployment/backend — HPA 2→6 replicas"]
                BE1["Pod: backend-xxx-1\nImage: collector-shop-backend:N\nNode.js 20 non-root\nPort: 5000"]
                BE2["Pod: backend-xxx-2\nImage: collector-shop-backend:N\nNode.js 20 non-root\nPort: 5000"]
                INIT1["InitContainer: wait-for-postgres\nInitContainer: wait-for-redis"]
            end

            subgraph STATEFUL["StatefulSets / Deployments"]
                PG_POD["postgres-xxx\nimage: postgres:15-alpine\nPVC: 10Gi · ConfigMap: init.sql"]
                RD_POD["redis-xxx\nimage: redis:7-alpine\nPVC: 5Gi"]
                MN_POD["minio-xxx\nimage: minio/minio:latest\nPVC: 20Gi · Port: 9000/9001"]
            end

            subgraph MONITORING_PODS["Monitoring Pods"]
                VM_POD["victoriametrics-xxx\nimage: victoriametrics:latest\nPVC: 5Gi · Port: 8428"]
                GF_POD["grafana-xxx\nimage: grafana/grafana:latest\nPVC: 5Gi · Port: 3000"]
                LK_POD["loki-xxx\nimage: grafana/loki:latest\nPVC: 10Gi · Port: 3100"]
                PT_POD["promtail-xxx (DaemonSet)\nimage: grafana/promtail:latest\nmounts: /var/log/pods"]
            end

            PVC["PersistentVolumeClaims\npostgres: 10Gi ✅ Bound\nredis: 5Gi ✅ Bound\nminio: 20Gi ✅ Bound\nvictoriametrics: 5Gi ✅ Bound\ngrafana: 5Gi ✅ Bound\nloki: 10Gi ✅ Bound"]
        end

        subgraph NS_DEV["namespace: collector-shop-dev"]
            DEV_PODS["backend × 1 · frontend × 1\nhttps://dev.shopcollector.local"]
        end

        subgraph NS_STG["namespace: collector-shop-staging"]
            STG_PODS["backend × 2 · frontend × 2\nhttps://staging.shopcollector.local"]
        end

        subgraph NS_ARGOCD["namespace: argocd"]
            ARGOCD_POD["ArgoCD Server\nArgoCD Repo Server\nArgoCD App Controller\nhttps://argocd.shopcollector.local"]
        end

        subgraph NS_GITEA["namespace: gitea"]
            GITEA_POD["gitea/gitea:1.21-rootless\nNodePort: 31200 (HTTP)\nNodePort: 31022 (SSH)\nPVC: 2Gi"]
        end

        subgraph NS_NETDATA["Netdata (DaemonSet)"]
            ND_PARENT["Netdata Parent\n:30199 / :19999\nDashboard global"]
            ND_CHILD["Netdata Child (chaque node)\nCPU · RAM · disque · réseau\nK8s pods · PostgreSQL · Redis"]
            ND_CHILD -->|"streaming"| ND_PARENT
        end
    end

    ING --> DEPLOY_FE
    ING --> DEPLOY_BE
    INIT1 -.->|"waitFor"| PG_POD
    INIT1 -.->|"waitFor"| RD_POD
    BE1 --> PG_POD
    BE1 --> RD_POD
    BE1 --> MN_POD
    BE1 -->|"push metrics"| VM_POD
    PT_POD -->|"push logs"| LK_POD
    LK_POD --> GF_POD
    VM_POD --> GF_POD
    ARGOCD_POD -->|"auto-sync\nkubectl apply"| NS_PROD
    ARGOCD_POD -->|"auto-sync"| NS_DEV
    ARGOCD_POD -->|"auto-sync"| NS_STG

    style ING fill:#1c3a2e,stroke:#10b981,color:#6ee7b7
    style ARGOCD_POD fill:#2d1b69,stroke:#a855f7,color:#d8b4fe
    style GITEA_POD fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style PG_POD fill:#1e3a5f,stroke:#60a5fa,color:#bfdbfe
    style RD_POD fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style MN_POD fill:#3b1a2e,stroke:#ec4899,color:#fbcfe8
    style VM_POD fill:#3b2000,stroke:#f97316,color:#fdba74
    style GF_POD fill:#3b2000,stroke:#f59e0b,color:#fde68a
    style LK_POD fill:#1a2e1a,stroke:#4ade80,color:#bbf7d0
    style ND_PARENT fill:#1e293b,stroke:#94a3b8,color:#e2e8f0
```

---

## 5. FLUX GITOPS — DE GIT PUSH À KUBERNETES

```mermaid
sequenceDiagram
    actor DEV as Développeur
    participant GITEA as Gitea (local Git)
    participant JENKINS as Jenkins CI
    participant SONAR as SonarCloud
    participant MINIK as Minikube Docker
    participant ARGO as ArgoCD
    participant K8S as Kubernetes

    DEV->>GITEA: git push (main)
    GITEA-->>JENKINS: SCM webhook / poll 2min

    rect rgb(28, 58, 46)
        note over JENKINS: Stage 2 — Lint + Qualité (parallèle)
        JENKINS->>SONAR: npx sonarqube-scanner
        SONAR-->>JENKINS: Quality Gate result
    end

    rect rgb(28, 58, 46)
        note over JENKINS: Stage 3 — Tests (parallèle)
        JENKINS->>JENKINS: PostgreSQL éphémère :15432
        JENKINS->>JENKINS: Jest Backend (18 tests)
        JENKINS->>JENKINS: Jest Frontend (2 tests)
    end

    rect rgb(59, 21, 21)
        note over JENKINS: Stage 4 — Sécurité (parallèle)
        JENKINS->>JENKINS: Trivy FS scan
        JENKINS->>JENKINS: npm audit --critical
    end

    rect rgb(28, 58, 46)
        note over JENKINS: Stage 5 — Build Docker (parallèle)
        JENKINS->>MINIK: docker build backend:BUILD_NUMBER
        JENKINS->>MINIK: docker build frontend:BUILD_NUMBER
        JENKINS->>JENKINS: Trivy image scan
        JENKINS->>MINIK: docker save | docker load (TLS)
    end

    rect rgb(45, 27, 105)
        note over JENKINS: Stage 6 — GitOps
        JENKINS->>GITEA: kustomize edit set image :BUILD_NUMBER
        JENKINS->>GITEA: git push manifest (kustomization.yaml)
        GITEA-->>ARGO: poll 3 min → détecte changement tag
        ARGO->>K8S: kubectl apply (rolling update)
        K8S-->>ARGO: Synced + Healthy ✅
        ARGO-->>JENKINS: REST API status
    end

    rect rgb(28, 58, 46)
        note over JENKINS: Stage 7 — Tests post-déploiement
        JENKINS->>K8S: curl health checks (smoke tests)
        JENKINS->>K8S: Artillery load tests (P95 < 500ms)
    end

    JENKINS->>DEV: Discord notification (success/failure/unstable)
```

---

## 6. MODÈLE DE DONNÉES (ERD)

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string passwordHash
        enum role "BUYER|SELLER|ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    SHOP {
        uuid id PK
        string name
        string description
        uuid ownerId FK
    }

    ANNOUNCEMENT {
        uuid id PK
        string title
        text description
        float price
        enum status "ACTIVE|SOLD|DRAFT"
        string category
        string[] images
        uuid sellerId FK
        uuid shopId FK
        datetime createdAt
    }

    PURCHASE {
        uuid id PK
        float amount
        enum status "PENDING|CONFIRMED|CANCELLED"
        enum deliveryStatus "PENDING|PREPARING|SHIPPED|IN_TRANSIT|DELIVERED|CANCELLED"
        string trackingNumber
        uuid announcementId FK
        uuid buyerId FK
        datetime createdAt
    }

    CONVERSATION {
        uuid id PK
        uuid user1Id FK
        uuid user2Id FK
        uuid announcementId FK
        datetime lastMessageAt
    }

    MESSAGE {
        uuid id PK
        text content
        boolean read
        uuid conversationId FK
        uuid senderId FK
        uuid receiverId FK
        datetime createdAt
    }

    COLLECTION {
        uuid id PK
        string name
        string description
        uuid shopId FK
    }

    COLLECTION_ITEM {
        uuid id PK
        uuid collectionId FK
        uuid announcementId FK
    }

    USER ||--o{ ANNOUNCEMENT : "crée (SELLER)"
    USER ||--o{ PURCHASE : "effectue (BUYER)"
    USER ||--|| SHOP : "possède (SELLER)"
    USER ||--o{ MESSAGE : "envoie"
    SHOP ||--o{ ANNOUNCEMENT : "contient"
    SHOP ||--o{ COLLECTION : "organise"
    ANNOUNCEMENT ||--o{ PURCHASE : "génère"
    ANNOUNCEMENT ||--o{ CONVERSATION : "est sujet de"
    ANNOUNCEMENT ||--o{ COLLECTION_ITEM : "appartient à"
    USER ||--o{ CONVERSATION : "participe"
    CONVERSATION ||--o{ MESSAGE : "contient"
    COLLECTION ||--o{ COLLECTION_ITEM : "regroupe"
```

---

## 7. SÉCURITÉ — COUCHES DE PROTECTION (Defense in Depth)

```mermaid
graph TD
    INTERNET["🌐 Internet"]

    subgraph L1["Couche 1 — Réseau"]
        TLS["TLS 1.3 / HTTPS\nmkcert wildcard cert\nHTTP → 308 HTTPS"]
    end

    subgraph L2["Couche 2 — Application Gateway"]
        HELMET["Helmet.js\nCSP · HSTS · X-Frame-Options\nX-Content-Type-Options · XSS-Protection"]
        CORS["CORS strict\norigin whitelist\nno wildcard *"]
    end

    subgraph L3["Couche 3 — Rate Limiting"]
        RATE["express-rate-limit\n100 req / 15min / IP\nRedis distributed store"]
    end

    subgraph L4["Couche 4 — Authentification"]
        JWT["JWT HS256\naccess: 15 min\nrefresh: 7 jours\nfail-fast si secret absent"]
    end

    subgraph L5["Couche 5 — Autorisation"]
        RBAC["RBAC Middleware\nBUYER · SELLER · ADMIN\nprincipe moindre privilège"]
    end

    subgraph L6["Couche 6 — Validation"]
        ZOD["Zod Runtime Validation\nsanitization · type coercion\nrejet si schéma invalide"]
    end

    subgraph L7["Couche 7 — ORM Protection"]
        PRISMA["Prisma ORM\nparameterized queries\nSQL Injection impossible"]
    end

    subgraph L8["Couche 8 — Business Logic"]
        FRAUD["Fraud Detection\nauto-buy · duplicate · patterns\nscore 0-100 → BLOCK si ≥ 70"]
        MOD["Moderation\nspam · prix suspects\ndoublons → reject si score ≥ 50"]
    end

    subgraph L9["Couche 9 — DevSecOps"]
        TRIVY["Trivy\nFS scan + Image scan\n--severity HIGH,CRITICAL"]
        SONAR["SonarCloud\nSAST · code smells\nQuality Gate"]
        AUDIT["Audit Logger\nWinston JSON\nACTION · USER · IP · RESOURCE"]
        NPMAUDIT["npm audit\n--audit-level=critical\nbloque le pipeline"]
    end

    INTERNET -->|"HTTPS :443"| TLS
    TLS --> HELMET
    HELMET --> CORS
    CORS --> RATE
    RATE --> JWT
    JWT --> RBAC
    RBAC --> ZOD
    ZOD --> PRISMA
    PRISMA --> FRAUD
    PRISMA --> MOD
    TRIVY -.->|"CI/CD gate"| TLS
    SONAR -.->|"CI/CD gate"| TLS

    style INTERNET fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style TLS fill:#1c3a2e,stroke:#10b981,color:#6ee7b7
    style HELMET fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style RATE fill:#3b2800,stroke:#f59e0b,color:#fde68a
    style JWT fill:#1e3a5f,stroke:#60a5fa,color:#bfdbfe
    style RBAC fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style ZOD fill:#2d1b69,stroke:#a855f7,color:#d8b4fe
    style PRISMA fill:#1e3a5f,stroke:#60a5fa,color:#bfdbfe
    style FRAUD fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style MOD fill:#3b1515,stroke:#f97316,color:#fdba74
    style TRIVY fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style SONAR fill:#1e293b,stroke:#f59e0b,color:#fcd34d
    style AUDIT fill:#1e293b,stroke:#94a3b8,color:#e2e8f0
```

---

## 8. ARCHITECTURE V2 — VISION MICROSERVICES

```mermaid
graph TB
    USERS["🖥️ Clients\nBrowser · Mobile · PWA"]

    subgraph CDN["CDN / Edge"]
        CF["Cloudflare\nDDoS · WAF · Cache statique"]
    end

    subgraph GW["API Gateway"]
        KONG["Kong / NGINX Plus\nLoad Balancer · Rate Limit\nJWT Verify · Routing"]
    end

    subgraph MS["Microservices (Kubernetes — namespaces dédiés)"]
        direction TB

        subgraph AUTH_MS["Auth Service"]
            AUTH["Node.js · JWT RS256\nOAuth2 / OIDC\n2FA TOTP\nDB: PostgreSQL auth"]
        end

        subgraph CATALOG_MS["Catalog Service"]
            CAT["Node.js · Prisma\nCRUD Announcements\nFull-text Search\nDB: PostgreSQL catalog\nSearch: Elasticsearch"]
        end

        subgraph PURCHASE_MS["Purchase Service"]
            PURCH["Node.js · Stripe\nPaiement CB réel\nStripe Webhooks\nDB: PostgreSQL orders"]
        end

        subgraph NOTIF_MS["Notification Service"]
            NOTIF["Node.js · SendGrid\nEmail · Push · WebSocket\nDB: Redis Pub/Sub"]
        end

        subgraph CHAT_MS["Chat Service"]
            CHAT["Node.js · Socket.io\nWebSocket temps réel\nDB: Redis + PostgreSQL"]
        end

        subgraph FRAUD_MS["Fraud Detection Service"]
            FRAUD["Python · ML Models\nScoring temps réel\nDB: PostgreSQL events"]
        end

        subgraph MEDIA_MS["Media Service"]
            MEDIA["Node.js · Sharp\nResize · Convert · CDN\nStorage: AWS S3 + CloudFront"]
        end
    end

    subgraph MQ["Message Queue"]
        KAFKA["Apache Kafka\nTopics: purchases · notifications\nmoderation · fraud · analytics"]
    end

    subgraph OBS_V2["Observabilité V2"]
        PROM["Prometheus\nmétriques par service"]
        GRAFANA["Grafana + Loki\ndashboards unifiés"]
        JAEGER["Jaeger / Tempo\nDistributed Tracing\nOpenTelemetry"]
        PROM --> GRAFANA
        JAEGER --> GRAFANA
    end

    subgraph EXTERNAL["Services Externes"]
        STRIPE["Stripe API\nPaiement CB"]
        SENDGRID["SendGrid\nEmails transactionnels"]
        AWSS3["AWS S3 + CloudFront\nImages CDN"]
    end

    USERS -->|"HTTPS"| CF
    CF --> KONG
    KONG --> AUTH_MS
    KONG --> CATALOG_MS
    KONG --> PURCHASE_MS
    KONG --> NOTIF_MS
    KONG --> CHAT_MS
    KONG --> MEDIA_MS

    PURCH --> KAFKA
    PURCH --> STRIPE
    CATALOG_MS --> KAFKA
    KAFKA --> NOTIF_MS
    KAFKA --> FRAUD_MS
    NOTIF_MS --> SENDGRID
    MEDIA_MS --> AWSS3

    AUTH_MS -.->|"traces"| JAEGER
    CATALOG_MS -.->|"traces"| JAEGER
    PURCH -.->|"traces"| JAEGER

    style CF fill:#3b2000,stroke:#f97316,color:#fdba74
    style KONG fill:#3b2000,stroke:#f59e0b,color:#fde68a
    style AUTH fill:#1e3a5f,stroke:#60a5fa,color:#bfdbfe
    style CAT fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style PURCH fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style NOTIF fill:#2d1b69,stroke:#a855f7,color:#d8b4fe
    style CHAT fill:#2d1b69,stroke:#818cf8,color:#c7d2fe
    style FRAUD fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style MEDIA fill:#3b1a2e,stroke:#ec4899,color:#fbcfe8
    style KAFKA fill:#3b1515,stroke:#f97316,color:#fdba74
    style STRIPE fill:#1c3a2e,stroke:#10b981,color:#6ee7b7
```

---

## 9. STRATÉGIE MIGRATION V1 → V2

```mermaid
graph LR
    V1["V1\nMonolithe Modulaire\n(actuel)\nDocker Compose\n7 services"]

    P1["Phase 1\nExtraire Auth Service\nJWT RS256 · OAuth2 · 2FA\n+ Kubernetes prod"]

    P2["Phase 2\nExtraire Payment Service\nStripe réel · webhooks\n+ Kafka messaging"]

    P3["Phase 3\nExtraire Catalog + Search\nElasticsearch full-text\n+ CDN Cloudflare"]

    P4["Phase 4\nExtraire Notification + Chat\nWebSocket · Redis Pub/Sub\n+ Jaeger tracing"]

    P5["Phase 5\nFraud Detection ML\nPython · modèles ML\n+ WAF Kong"]

    V2["V2\nMicroservices Complets\nKubernetes multi-node\nIstio Service Mesh\nAWS EKS"]

    V1 -->|"0→1k users\n2 devs\nM0-M3"| P1
    P1 -->|"1k→5k users\n3 devs\nM3-M6"| P2
    P2 -->|"5k→10k users\n4 devs\nM6-M9"| P3
    P3 -->|"10k→50k users\n5 devs\nM9-M12"| P4
    P4 -->|"50k→100k users\n6 devs\nM12-M18"| P5
    P5 -->|"100k+ users\nequipe DevOps\nM18+"| V2

    style V1 fill:#3b2800,stroke:#f59e0b,color:#fde68a
    style P1 fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style P2 fill:#1e3a5f,stroke:#60a5fa,color:#bfdbfe
    style P3 fill:#1c3a2e,stroke:#22c55e,color:#86efac
    style P4 fill:#2d1b69,stroke:#a855f7,color:#d8b4fe
    style P5 fill:#3b1515,stroke:#ef4444,color:#fca5a5
    style V2 fill:#1c3a2e,stroke:#10b981,color:#6ee7b7
```

---

## Récapitulatif des choix techniques

| Composant | Choix V1 | Alternative écartée | Justification |
|-----------|----------|---------------------|---------------|
| **Frontend** | React 18 + MUI | Vue.js, Angular | Écosystème, Material-UI a11y, équipe |
| **Backend** | Express.js + TypeScript | NestJS, Fastify | Simplicité, flexibilité, maturité |
| **ORM** | Prisma 5 | TypeORM | Type-safety, DX, +13% perf (POC) |
| **DB principale** | PostgreSQL 15 | MySQL, MongoDB | ACID, JSON, full-text, maturité |
| **Cache** | Redis 7 | Memcached | Rich data structures, pub/sub |
| **Storage** | MinIO | AWS S3 | S3-compatible, self-hosted, 0€ |
| **Monitoring métriques** | VictoriaMetrics | Prometheus | Performance, compression, API compat. |
| **Monitoring logs** | Loki + Promtail | ELK Stack | Léger, Kubernetes-native, Grafana compat. |
| **System monitoring** | Netdata | Datadog, Zabbix | 100% local, 0 API key, granularité 1s |
| **CI/CD** | Jenkins local | GitLab CI | Infrastructure locale, démo sans internet |
| **GitOps CD** | ArgoCD | Flux | Interface web, multi-app, RBAC |
| **Git local** | Gitea | Gogs, GitLab | Léger, ArgoCD natif, webhooks |
| **Conteneurs** | Docker | Podman | Standard industrie, compose |
| **Orchestration** | Kubernetes + Minikube | Docker Swarm | Standard industrie, HPA, GitOps |

---

*Architecture mise à jour le 18 mars 2026*
*Version : 2.0 — Collector.shop — MOUYAHADA Ismail*
