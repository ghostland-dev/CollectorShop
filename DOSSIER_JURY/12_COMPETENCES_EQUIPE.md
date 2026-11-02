# 👥 Cartographie des Compétences — Collector.shop

**Date** : 21 février 2026
**Version** : 1.0
**Projet** : Collector.shop V1 (POC) → V2 (Production)

---

## 🎯 1. CONTEXTE ET OBJECTIFS

### 1.1 Vision Produit

**V1 (POC - Actuel)** :
- Architecture monolithique modulaire
- Backend Node.js + Frontend React
- Déploiement Kubernetes (Minikube)
- Stack : PostgreSQL, Redis, MinIO
- Observabilité : Grafana + Loki + VictoriaMetrics

**V2 (Production - 12 mois)** :
- Migration progressive vers microservices
- Kubernetes production (EKS/GKE)
- Haute disponibilité (multi-AZ)
- Scaling automatique (HPA)
- Monitoring avancé (Tempo pour traces)

### 1.2 Objectifs de la cartographie

✅ Identifier les compétences nécessaires
✅ Évaluer l'équipe actuelle
✅ Planifier la montée en compétence
✅ Budgeter les formations
✅ Éviter le "mouton à 5 pattes"

---

## 👥 2. ÉQUIPE CIBLE

### 2.1 Composition Équipe V1 (4 personnes)

| Rôle | Nombre | Profil | Expérience |
|------|--------|--------|------------|
| **Full-Stack Lead** | 1 | Senior (5+ ans) | Node.js, React, DevOps |
| **Backend Developer** | 1 | Mid-level (3 ans) | Node.js, PostgreSQL, API |
| **Frontend Developer** | 1 | Mid-level (3 ans) | React, TypeScript, UI/UX |
| **DevOps/SRE** | 1 | Junior (1-2 ans) | Kubernetes, CI/CD, Monitoring |

**Total** : 4 personnes (équipe startup lean)

### 2.2 Évolution Équipe V2 (6 personnes)

| Rôle | Évolution | Justification |
|------|-----------|---------------|
| Full-Stack Lead | Reste 1 | Architecture + mentorat |
| Backend Developer | **1 → 2** | Microservices + charge |
| Frontend Developer | Reste 1 | Suffisant V2 |
| DevOps/SRE | **1 → 2** | Kubernetes prod + oncall |

**Total** : 6 personnes (+50% effectif)

---

## 🛠️ 3. COMPÉTENCES PAR RÔLE

### 3.1 Full-Stack Lead Developer

#### Compétences V1 (Actuelles) ✅

**Backend** :
- ✅ Node.js + TypeScript avancé
- ✅ Express.js + architecture REST
- ✅ Prisma ORM
- ✅ PostgreSQL (requêtes optimisées)
- ✅ Redis (caching, sessions)
- ✅ JWT + authentification

**Frontend** :
- ✅ React + TypeScript
- ✅ State management (Context API)
- ✅ React Router
- ✅ Responsive design
- ✅ Vite (build tool)

**DevOps** :
- ✅ Docker + Docker Compose
- ✅ Kubernetes basics
- ✅ CI/CD (GitHub Actions)
- ✅ Monitoring (Grafana)

**Architecture** :
- ✅ Design patterns (MVC, Repository)
- ✅ Clean Architecture
- ✅ SOLID principles

#### Compétences V2 (À acquérir) 🎓

**Microservices** :
- 🎓 Service mesh (Istio/Linkerd) — **6 mois**
- 🎓 Event-driven architecture (Kafka) — **4 mois**
- 🎓 API Gateway (Kong/Ambassador) — **2 mois**

**Cloud Native** :
- 🎓 Kubernetes avancé (Operators, CRD) — **6 mois**
- 🎓 Terraform (IaC) — **3 mois**
- 🎓 Helm charts — **2 mois**

**Observabilité** :
- 🎓 Distributed tracing (Tempo/Jaeger) — **2 mois**
- 🎓 OpenTelemetry — **3 mois**

---

### 3.2 Backend Developer

#### Compétences V1 (Actuelles) ✅

**Core** :
- ✅ Node.js + TypeScript
- ✅ Express.js
- ✅ Prisma ORM
- ✅ PostgreSQL
- ✅ Tests (Jest, Supertest)
- ✅ API REST

**Sécurité** :
- ✅ JWT
- ✅ Bcrypt
- ✅ Helmet.js
- ✅ Rate limiting

**Performance** :
- ✅ Redis caching
- ✅ Query optimization
- ✅ Indexation DB

#### Compétences V2 (À acquérir) 🎓

**Microservices** :
- 🎓 gRPC — **3 mois**
- 🎓 Message brokers (RabbitMQ/Kafka) — **4 mois**
- 🎓 Circuit breakers (Resilience4j) — **2 mois**

**Base de données** :
- 🎓 Sharding — **4 mois**
- 🎓 Réplication master-slave — **2 mois**
- 🎓 NoSQL (MongoDB pour certains services) — **3 mois**

**Monitoring** :
- 🎓 Métriques custom (Prometheus) — **2 mois**
- 🎓 Alerting (AlertManager) — **1 mois**

---

### 3.3 Frontend Developer

#### Compétences V1 (Actuelles) ✅

**Core** :
- ✅ React + TypeScript
- ✅ React Hooks
- ✅ Context API
- ✅ React Router
- ✅ Axios (HTTP client)

**UI/UX** :
- ✅ CSS3 + Flexbox/Grid
- ✅ Responsive design
- ✅ Accessibility basics (ARIA)

**Tooling** :
- ✅ Vite
- ✅ ESLint + Prettier
- ✅ Git

**Tests** :
- ✅ Vitest
- ✅ React Testing Library

#### Compétences V2 (À acquérir) 🎓

**State Management** :
- 🎓 Redux Toolkit (pour app complexe) — **2 mois**
- 🎓 React Query (server state) — **1 mois**

**Performance** :
- 🎓 Code splitting — **1 mois**
- 🎓 Lazy loading — **1 mois**
- 🎓 Memoization avancée — **1 mois**

**PWA** :
- 🎓 Service Workers — **2 mois**
- 🎓 Offline mode — **2 mois**

**Tests** :
- 🎓 E2E (Playwright/Cypress) — **2 mois**

---

### 3.4 DevOps/SRE

#### Compétences V1 (Actuelles) ✅

**Containers** :
- ✅ Docker
- ✅ Docker Compose
- ✅ Multi-stage builds

**Kubernetes** :
- ✅ Minikube
- ✅ Deployments, Services, ConfigMaps, Secrets
- ✅ kubectl basics
- ✅ Health probes

**CI/CD** :
- ✅ GitHub Actions
- ✅ Pipeline multi-stages
- ✅ Tests automatisés

**Monitoring** :
- ✅ Grafana dashboards
- ✅ Loki (logs)
- ✅ VictoriaMetrics (métriques)

#### Compétences V2 (À acquérir) 🎓

**Kubernetes Production** :
- 🎓 EKS/GKE/AKS — **6 mois**
- 🎓 Ingress Controllers (Nginx/Traefik) — **2 mois**
- 🎓 Network Policies — **2 mois**
- 🎓 RBAC avancé — **2 mois**
- 🎓 Helm charts — **3 mois**
- 🎓 Operators — **4 mois**

**Infrastructure as Code** :
- 🎓 Terraform — **4 mois**
- 🎓 Ansible — **2 mois**

**Observabilité avancée** :
- 🎓 Distributed tracing (Tempo) — **3 mois**
- 🎓 OpenTelemetry — **3 mois**
- 🎓 On-call + incident response — **Continu**

**Sécurité** :
- 🎓 HashiCorp Vault — **3 mois**
- 🎓 Certificate management (cert-manager) — **2 mois**
- 🎓 Security scanning — **2 mois**

---

## 📚 4. PLAN DE FORMATION (12 MOIS)

### Phase 1 : Consolidation (M1-M2) — Budget : 3 000€

**Objectif** : Renforcer les bases V1

| Formation | Cible | Durée | Coût | Priorité |
|-----------|-------|-------|------|----------|
| Kubernetes Fundamentals (CNCF) | DevOps | 2j | 800€ | P1 |
| Advanced TypeScript | Backend + Lead | 1j | 600€ | P2 |
| React Performance | Frontend | 1j | 600€ | P2 |
| Security Best Practices | Tous | 1j | 1 000€ | P1 |

**Total Phase 1** : **3 000€**

---

### Phase 2 : Préparation V2 (M3-M6) — Budget : 8 500€

**Objectif** : Acquérir compétences microservices + Kubernetes prod

| Formation | Cible | Durée | Coût | Priorité |
|-----------|-------|-------|------|----------|
| Microservices Architecture | Lead + Backend | 3j | 2 000€ | P1 |
| Kubernetes Administration (CKA) | DevOps | 5j | 1 500€ | P1 |
| Terraform Associate | DevOps | 3j | 1 200€ | P1 |
| gRPC + Protobuf | Backend | 2j | 800€ | P2 |
| Kafka Fundamentals | Backend + Lead | 2j | 1 000€ | P2 |
| Redux Toolkit | Frontend | 1j | 500€ | P3 |
| Grafana Advanced | DevOps | 1j | 500€ | P3 |
| OpenTelemetry | Lead + DevOps | 2j | 1 000€ | P2 |

**Total Phase 2** : **8 500€**

---

### Phase 3 : Spécialisation (M7-M12) — Budget : 7 400€

**Objectif** : Expertise avancée + certifications

| Formation | Cible | Durée | Coût | Priorité |
|-----------|-------|-------|------|----------|
| CKA (Certified Kubernetes Admin) | DevOps | Exam | 375€ | P1 |
| Istio Service Mesh | Lead + DevOps | 2j | 1 200€ | P2 |
| AWS Solutions Architect | Lead + DevOps | 5j | 2 500€ | P1 |
| PostgreSQL Performance Tuning | Backend | 2j | 900€ | P2 |
| React Native (mobile) | Frontend | 3j | 1 200€ | P3 |
| SRE Practices | DevOps | 2j | 800€ | P1 |
| Incident Response | Tous | 1j | 425€ | P2 |

**Total Phase 3** : **7 400€**

---

### 4.1 Budget Formation Total

| Phase | Période | Budget | Cumul |
|-------|---------|--------|-------|
| Phase 1 | M1-M2 | 3 000€ | 3 000€ |
| Phase 2 | M3-M6 | 8 500€ | 11 500€ |
| Phase 3 | M7-M12 | 7 400€ | **18 900€** |

**Budget annuel** : **18 900€**
**Par personne** : ~4 725€/an (réaliste pour startup)

### 4.2 Formations Continues (Année 2+)

| Type | Fréquence | Coût/an |
|------|-----------|---------|
| Conférences (KubeCon, React Conf) | 2/an | 4 000€ |
| Livres techniques | 5/personne | 400€ |
| Udemy/Pluralsight (team) | Continu | 600€ |
| Meetups/Workshops | Mensuel | 0€ |
| Certifications refresh | 1/2 ans | 2 000€ |

**Total Année 2+** : **7 000€/an**

---

## 🎯 5. COHÉRENCE ARCHITECTURE ↔ COMPÉTENCES

### 5.1 V1 (POC) — Équipe actuelle SUFFIT ✅

| Besoin V1 | Compétence équipe | Gap | Action |
|-----------|-------------------|-----|--------|
| Backend Node.js | ✅ Lead + Backend dev | 0 | Aucune |
| Frontend React | ✅ Frontend dev | 0 | Aucune |
| PostgreSQL | ✅ Backend dev | 0 | Aucune |
| Kubernetes (Minikube) | ✅ DevOps (junior) | Mineur | Formation (Phase 1) |
| Monitoring (Grafana) | ✅ DevOps | 0 | Aucune |
| CI/CD (GitHub Actions) | ✅ Lead + DevOps | 0 | Aucune |

**Conclusion V1** : ✅ Équipe de 4 personnes est **suffisante et qualifiée**.

---

### 5.2 V2 (Production) — Besoin montée en compétence 🎓

| Besoin V2 | Compétence équipe | Gap | Action |
|-----------|-------------------|-----|--------|
| Microservices | ❌ Aucune | **Élevé** | Formation M3-M6 (Phase 2) |
| Kubernetes prod (EKS) | ⚠️ Bases only | **Moyen** | Formation + CKA (Phase 2-3) |
| Service mesh (Istio) | ❌ Aucune | **Élevé** | Formation M7+ (Phase 3) |
| Terraform | ❌ Aucune | **Moyen** | Formation M3 (Phase 2) |
| gRPC | ❌ Aucune | **Moyen** | Formation M4 (Phase 2) |
| Kafka | ❌ Aucune | **Moyen** | Formation M5 (Phase 2) |
| Distributed tracing | ❌ Aucune | **Faible** | Formation M6+ (Phase 3) |

**Conclusion V2** :
- ✅ Base solide pour démarrer
- 🎓 **6 mois de formation** nécessaires
- 💰 Budget formation : 18 900€
- ➕ Option : Recruter un Senior DevOps (alternative formation)

---

### 5.3 Alternative : Recrutement vs Formation

| Option | Coût | Délai | Avantages | Inconvénients |
|--------|------|-------|-----------|---------------|
| **Formation interne** | 18 900€ | 6-12 mois | Team building, Fidélisation | Montée en compétence progressive |
| **Recrutement Senior DevOps** | 60k€/an | 3-6 mois (recrutement) | Expertise immédiate, Mentorat | Coût élevé, Turnover possible |
| **Mixte (Formation + Junior DevOps #2)** | 40k€/an + 10k€ formation | 6 mois | Équilibre coût/compétence | Gestion 2 juniors |

**Recommandation** :
- **V1 → V2 (6 premiers mois)** : Formation interne (18 900€)
- **V2+ (après M6)** : Recruter Senior DevOps #2 si croissance confirmée

---

## 📊 6. MATRICE COMPÉTENCES

### 6.1 État actuel (V1)

| Compétence | Lead | Backend | Frontend | DevOps | Gap V2 |
|------------|------|---------|----------|--------|--------|
| Node.js | ⭐⭐⭐⭐ | ⭐⭐⭐ | - | - | ✅ OK |
| React | ⭐⭐⭐ | - | ⭐⭐⭐⭐ | - | ✅ OK |
| PostgreSQL | ⭐⭐⭐⭐ | ⭐⭐⭐ | - | ⭐ | ✅ OK |
| Kubernetes | ⭐⭐ | - | - | ⭐⭐ | ⚠️ Moyen |
| Microservices | ⭐ | - | - | - | ❌ Élevé |
| Terraform | - | - | - | - | ❌ Élevé |
| gRPC | - | - | - | - | ❌ Moyen |
| Kafka | - | - | - | - | ❌ Moyen |
| Service Mesh | - | - | - | - | ❌ Élevé |

**Légende** : - (aucune) | ⭐ (notions) | ⭐⭐ (junior) | ⭐⭐⭐ (mid) | ⭐⭐⭐⭐ (senior)

### 6.2 Cible après formation (V2 — M12)

| Compétence | Lead | Backend | Frontend | DevOps | Status |
|------------|------|---------|----------|--------|--------|
| Node.js | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | - | - | ✅ |
| React | ⭐⭐⭐ | - | ⭐⭐⭐⭐ | - | ✅ |
| PostgreSQL | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | - | ⭐⭐ | ✅ |
| Kubernetes | ⭐⭐⭐ | ⭐ | - | ⭐⭐⭐⭐ | ✅ |
| Microservices | ⭐⭐⭐ | ⭐⭐ | - | ⭐ | ✅ |
| Terraform | ⭐ | - | - | ⭐⭐⭐ | ✅ |
| gRPC | ⭐⭐ | ⭐⭐ | - | - | ✅ |
| Kafka | ⭐⭐ | ⭐⭐ | - | - | ✅ |
| Service Mesh | ⭐⭐ | - | - | ⭐⭐ | ✅ |

**Évolution** : +2 niveaux en moyenne sur compétences critiques V2

---

## ✅ 7. POINTS CLÉS POUR LE JURY

### 7.1 Pas de "mouton à 5 pattes" ✅

❌ **Erreur à éviter** :
- Chercher un "Full-Stack DevOps Expert Kubernetes gRPC Kafka" (n'existe pas)
- Stack technologique irréaliste pour 4 personnes

✅ **Notre approche** :
- Stack cohérente et maîtrisable (Node.js + React)
- Spécialisation par rôle (Frontend, Backend, DevOps)
- Lead technique pour architecture globale
- Montée en compétence progressive (6-12 mois)

### 7.2 Budget réaliste ✅

✅ **18 900€/an** pour 4 personnes = **4 725€/personne**
- Cohérent avec budget formation startup/PME (3-5k€/personne)
- Plus rentable que recrutement senior (60k€/an)
- Fidélisation de l'équipe

❌ **Budget irréaliste** :
- 50 000€ formation (trop élevé pour 4 personnes)
- 1 000€ total (pas crédible)

### 7.3 Cohérence V1 vs V2 ✅

✅ **V1 (POC)** :
- Équipe de 4 personnes **SUFFIT**
- Compétences actuelles **ADÉQUATES**
- Pas de recrutement nécessaire

✅ **V2 (Production)** :
- **6 mois de formation** nécessaires
- **+2 personnes** si scaling confirmé (M12+)
- Alternative : Recruter Senior DevOps (60k€/an)

### 7.4 Plan de formation structuré ✅

✅ **3 phases progressives** :
- Phase 1 (M1-M2) : Consolidation bases
- Phase 2 (M3-M6) : Préparation V2 (microservices, K8s prod)
- Phase 3 (M7-M12) : Spécialisation (certifications, expertise)

✅ **Priorisation claire** :
- P1 (Critique) : Kubernetes, Sécurité, Microservices
- P2 (Important) : gRPC, Kafka, OpenTelemetry
- P3 (Nice-to-have) : Redux, React Native

---

## 🏆 8. CONCLUSION

### Synthèse

✅ **Équipe V1** : 4 personnes suffisantes et qualifiées
✅ **Budget formation** : 18 900€ (réaliste)
✅ **Timeline** : 6-12 mois de montée en compétence
✅ **Pas de "mouton à 5 pattes"** : Stack cohérente
✅ **Cohérence architecture** : V1 OK, V2 nécessite formation

### Risques identifiés

⚠️ **Risque 1** : Turnover pendant formation
- **Mitigation** : Contrats de formation (clause retour 2 ans)

⚠️ **Risque 2** : Formation insuffisante
- **Mitigation** : Mentorat externe (consulting 5j/mois)

⚠️ **Risque 3** : Timeline V2 trop ambitieuse
- **Mitigation** : MVP V2 avec fonctionnalités réduites

### Prochaines étapes

1. **Validation budget** : 18 900€ formation + 7 000€/an continu
2. **Kick-off Phase 1** : M1 (Kubernetes Fundamentals)
3. **Suivi trimestriel** : Évaluation compétences acquises
4. **Décision M6** : Formation seule OU recrutement Senior DevOps

---

**Document validé par** : Équipe Collector.shop
**Dernière mise à jour** : 21 février 2026
**Version** : 1.0
