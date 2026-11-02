# Security Policy — Collector.shop

## 🔒 Vue d'ensemble

Collector.shop prend la sécurité très au sérieux. Ce document décrit notre politique de sécurité, comment signaler des vulnérabilités, et les mesures de sécurité implémentées dans le projet.

---

## 📢 Signalement de vulnérabilités

### Comment signaler une vulnérabilité

Si vous découvrez une faille de sécurité dans Collector.shop, **ne créez PAS d'issue publique**. Contactez-nous de manière privée :

**📧 Email** : security@collector.shop
**🔐 PGP Key** : Disponible sur demande
**⏱️ SLA de réponse** :
- **Critique** (CVSS ≥ 9.0) : 24 heures
- **Élevé** (CVSS 7.0-8.9) : 48 heures
- **Moyen** (CVSS 4.0-6.9) : 7 jours
- **Faible** (CVSS < 4.0) : 14 jours

### Informations à inclure

Pour accélérer le traitement, veuillez fournir :
1. **Description détaillée** de la vulnérabilité
2. **Étapes de reproduction** (PoC si possible)
3. **Impact potentiel** (données exposées, privilèges, etc.)
4. **Version affectée** (commit SHA ou tag)
5. **Suggestions de correction** (optionnel)

### Processus de traitement

1. **Accusé de réception** sous 24-48h
2. **Évaluation** de la criticité (CVSS)
3. **Développement du patch** (timeline communiquée)
4. **Notification** avant publication du fix
5. **Publication** du correctif + CVE si applicable
6. **Crédit** au chercheur (si souhaité)

---

## 🛡️ Versions supportées

| Version | Support sécurité | Fin de support |
|---------|------------------|----------------|
| **1.x** (POC) | ✅ Actif | 2026-12-31 |
| **< 1.0** | ❌ Non supporté | - |

**Note** : Le POC V1 est destiné à la démonstration. Pour un déploiement en production, contactez l'équipe pour un audit de sécurité complet.

---

## 🔐 Mesures de sécurité implémentées

### Authentification & Autorisation

- **JWT (JSON Web Tokens)** :
  - Access token : 15 minutes (courte durée)
  - Refresh token : 7 jours (rotation recommandée)
  - Algorithme : HS256 (HMAC-SHA256)
  - Secrets stockés en variables d'environnement

- **Hachage des mots de passe** :
  - Algorithme : **bcrypt**
  - Salt rounds : **12** (recommandé OWASP)
  - Pas de stockage en clair

- **RBAC (Role-Based Access Control)** :
  - 3 rôles : BUYER, SELLER, ADMIN
  - Middleware `authorize()` pour contrôle granulaire
  - Principe du moindre privilège

### Protection des données

- **Validation des entrées** :
  - Zod pour validation runtime (TypeScript)
  - Sanitization des inputs utilisateur
  - Prisma ORM (protection SQL injection)

- **Headers de sécurité** (Helmet.js) :
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options: DENY` (anti-clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` (HSTS)
  - `X-XSS-Protection: 1; mode=block`

- **CORS** :
  - Configuration stricte par origine
  - Credentials autorisés uniquement pour frontend vérifié
  - Pas de wildcard (`*`) en production

- **Rate Limiting** :
  - 100 requêtes / 15 minutes par IP
  - Protection contre brute-force et DDoS
  - Redis pour tracking distribué

### Sécurité applicative

- **Protection OWASP Top 10** :
  - ✅ A01 (Broken Access Control) : RBAC + tests d'autorisation
  - ✅ A02 (Cryptographic Failures) : bcrypt, JWT, HTTPS
  - ✅ A03 (Injection) : Prisma ORM, Zod validation
  - ✅ A05 (Security Misconfiguration) : Helmet, fail-fast sur secrets
  - ✅ A07 (Authentication Failures) : JWT robuste, rate limiting
  - ⚠️ A09 (Logging Failures) : Logs Winston, audit logs en cours

- **Détection de fraude** :
  - Service `fraud-detection.service.ts` :
    - Détection auto-achat
    - Détection achats en double
    - Analyse patterns suspects
    - Score de risque (0-100)

- **Modération automatique** :
  - Service `moderation.service.ts` :
    - Détection spam (mots-clés suspects)
    - Validation prix (seuils min/max)
    - Détection doublons
    - Rejet automatique si score ≥ 50

### Infrastructure & DevSecOps

- **Scans de sécurité automatisés** (pipeline Jenkins) :
  - **Trivy FS** : Scan du filesystem + secrets (stage `Analyse Sécurité`)
  - **Trivy Images** : Scan des images Docker construites
  - **SonarCloud** : Analyse statique SAST (stage `Lint → Qualité`)
  - **npm audit** : Scan des dépendances (`--audit-level=critical`)
  - Rapport archivé comme artefact Jenkins

- **Gestion des secrets** :
  - Variables d'environnement (`.env` non commité)
  - Credentials Jenkins (SONAR_TOKEN, ARGOCD_TOKEN, DISCORD_WEBHOOK, GITHUB_TOKEN)
  - ⚠️ Vault recommandé pour production (HashiCorp Vault, AWS Secrets Manager)

- **Containerisation** :
  - Images Docker multi-stage (réduction surface d'attaque)
  - Utilisateur non-root (`nodejs:1001`)
  - Pas de secrets hardcodés dans images
  - Scan Trivy avant push

- **Monitoring & Alerting** :
  - VictoriaMetrics : Métriques de performance
  - Grafana : Dashboards + alertes
  - Winston : Logs structurés (JSON)
  - ⚠️ SIEM recommandé pour production (ELK Stack, Splunk)

---

## ⚠️ Limitations connues (POC V1)

Les limitations suivantes sont **acceptables pour un POC** mais doivent être corrigées avant production :

### Sécurité

1. **Pas de 2FA/MFA** :
   - Authentification à facteur unique (mot de passe seul)
   - **Risque** : Compromission par phishing
   - **Mitigation V2** : TOTP (Google Authenticator, Authy)

2. **Rotation des clés JWT manuelle** :
   - Clés JWT statiques (pas de rotation automatique)
   - **Risque** : Compromission long-terme si clé leakée
   - **Mitigation V2** : Rotation automatique tous les 90 jours

3. **Pas de chiffrement au repos** :
   - Base de données PostgreSQL sans TDE (Transparent Data Encryption)
   - **Risque** : Données lisibles si serveur compromis
   - **Mitigation production** : Activer TDE ou chiffrement disque (LUKS)

4. **Logs d'audit partiels** :
   - Pas de tracking exhaustif des actions sensibles
   - **Risque** : Traçabilité limitée en cas d'incident
   - **Mitigation V2** : Audit logs complets (CRUD Purchase, Announcement, User)

5. **Pas de WAF** :
   - Pas de Web Application Firewall
   - **Risque** : Exposition aux attaques applicatives (XSS, SQLi, etc.)
   - **Mitigation production** : AWS WAF, Cloudflare, ModSecurity

### Infrastructure

6. **Secrets avec fallback** :
   - JWT_SECRET a une valeur par défaut en développement
   - **Risque** : Déploiement accidentel en production avec secret faible
   - **Mitigation** : Fail-fast implémenté (v1.1)

7. **HTTPS non forcé** :
   - HTTP accepté en développement
   - **Risque** : Man-in-the-middle
   - **Mitigation production** : HTTPS obligatoire (Let's Encrypt, certificat valide)

8. **Pas de backup automatisé** :
   - Pas de stratégie de sauvegarde automatique
   - **Risque** : Perte de données en cas de défaillance
   - **Mitigation production** : Backups quotidiens chiffrés (AWS RDS, pg_dump)

---

## 📋 Checklist de sécurité pour production

Avant tout déploiement en production, vérifier :

### Configuration
- [ ] JWT_SECRET défini avec valeur forte (≥32 caractères aléatoires)
- [ ] JWT_REFRESH_SECRET différent de JWT_SECRET
- [ ] FRONTEND_URL configuré (pas de wildcard CORS)
- [ ] DATABASE_URL avec credentials sécurisés
- [ ] HTTPS activé avec certificat valide
- [ ] Helmet.js configuré avec CSP stricte

### Infrastructure
- [ ] Base de données avec TDE ou chiffrement disque
- [ ] Backups automatisés et testés (RPO < 24h)
- [ ] Monitoring actif (Grafana + alertes)
- [ ] Logs centralisés (ELK, Datadog, Splunk)
- [ ] WAF configuré (AWS WAF, Cloudflare)
- [ ] Rate limiting adapté au trafic réel

### Processus
- [ ] Scans de sécurité dans CI/CD (Snyk, Trivy)
- [ ] Revue de code obligatoire (≥1 reviewer)
- [ ] Tests de sécurité automatisés (OWASP ZAP)
- [ ] Plan de réponse aux incidents documenté
- [ ] Rotation des secrets planifiée (90 jours)

### Conformité
- [ ] RGPD : Consentement, droit à l'oubli, portabilité
- [ ] Politique de confidentialité publiée
- [ ] CGU/CGV validées juridiquement
- [ ] Audit de sécurité externe (recommandé)

---

## 🏆 Programme de reconnaissance

Nous valorisons les contributions de la communauté sécurité :

- **Hall of Fame** : Chercheurs crédités publiquement (si souhaité)
- **Récompenses** : Envisagées pour vulnérabilités critiques (à définir)
- **Collaboration** : Possibilité de co-rédiger l'advisory

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## 📞 Contact

**Équipe sécurité** : security@collector.shop
**Support général** : support@collector.shop
**Site web** : https://collector.shop

---

*Dernière mise à jour : 18 mars 2026*
*Version : 1.1*
