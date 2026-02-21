# 📋 Guide Loki - Centralisation des logs

## 🎯 Vue d'ensemble

**Loki** est maintenant déployé dans votre cluster Kubernetes pour centraliser et interroger les logs de tous vos services.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                    │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Backend  │  │ Frontend │  │PostgreSQL│             │
│  │  Pod     │  │   Pod    │  │   Pod    │   ...       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │              │                    │
│       └─────────────┴──────────────┘                    │
│                     │                                    │
│              ┌──────▼──────┐                            │
│              │  Promtail   │  (DaemonSet)               │
│              │ Log Agent   │                            │
│              └──────┬──────┘                            │
│                     │                                    │
│              ┌──────▼──────┐                            │
│              │    Loki     │  (Log Storage)             │
│              └──────┬──────┘                            │
│                     │                                    │
│              ┌──────▼──────┐                            │
│              │   Grafana   │  (Visualization)           │
│              └─────────────┘                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## ✅ Composants déployés

### 1. Loki
- **Rôle** : Stockage et indexation des logs
- **Port** : 3100 (HTTP), 9096 (gRPC)
- **Storage** : 10Gi PersistentVolume
- **Namespace** : collector-shop
- **Service** : `http://loki:3100` (ClusterIP)

### 2. Promtail
- **Rôle** : Agent de collecte des logs
- **Type** : DaemonSet (1 pod par node)
- **Collecte** : Tous les logs des pods Kubernetes
- **Envoie vers** : Loki

## 🔧 Configuration Grafana

### Étape 1 : Accéder à Grafana

```bash
# Ouvrir Grafana
http://192.168.49.2:30001

# Credentials
User: admin
Password: admin123
```

### Étape 2 : Ajouter Loki comme Data Source

1. **Menu** → **Configuration** (⚙️) → **Data Sources**
2. **Click** : "Add data source"
3. **Chercher** : "Loki"
4. **Configurer** :
   - **Name** : `Loki`
   - **URL** : `http://loki.collector-shop.svc.cluster.local:3100`
   - Ou simplement : `http://loki:3100`
5. **Click** : "Save & Test"

Vous devriez voir : ✅ "Data source is working"

### Étape 3 : Explorer les logs

1. **Menu** → **Explore** (🔍)
2. **Data source** : Sélectionner "Loki"
3. **Log browser** : Choisir un label

#### Exemples de requêtes LogQL

```logql
# Tous les logs du namespace
{namespace="collector-shop"}

# Logs du backend uniquement
{namespace="collector-shop", app="backend"}

# Logs du frontend
{namespace="collector-shop", app="frontend"}

# Logs de PostgreSQL
{namespace="collector-shop", app="postgres"}

# Filtrer par niveau de log
{namespace="collector-shop", app="backend"} |= "error"

# Logs contenant "API" ou "request"
{namespace="collector-shop"} |~ "API|request"

# Compter les erreurs
sum(count_over_time({namespace="collector-shop"} |= "error" [5m]))

# Rate d'erreurs par minute
rate({namespace="collector-shop", app="backend"} |= "error" [1m])
```

## 🎨 Créer un Dashboard de Logs

### Dashboard d'exemple : Monitoring des logs

1. **Menu** → **Dashboards** → **New Dashboard**
2. **Add panel**

#### Panel 1 : Taux d'erreurs Backend
```logql
sum(rate({namespace="collector-shop", app="backend"} |= "error" [5m]))
```
- Type : Time series
- Title : "Backend Error Rate"

#### Panel 2 : Top 10 erreurs
```logql
topk(10, sum by (error) (count_over_time({namespace="collector-shop"} |= "error" [1h])))
```
- Type : Table
- Title : "Top 10 Errors (Last Hour)"

#### Panel 3 : Logs en temps réel
```logql
{namespace="collector-shop", app="backend"}
```
- Type : Logs
- Title : "Backend Logs (Live)"

#### Panel 4 : Distribution des logs par service
```logql
sum by (app) (count_over_time({namespace="collector-shop"}[5m]))
```
- Type : Pie chart
- Title : "Logs Distribution by Service"

## 🔍 Commandes utiles

### Vérifier le statut de Loki

```bash
# Status des pods
kubectl get pods -n collector-shop -l app=loki

# Logs de Loki
kubectl logs -n collector-shop -l app=loki --tail=100

# Vérifier la santé de Loki
kubectl exec -n collector-shop $(kubectl get pod -n collector-shop -l app=backend -o jsonpath='{.items[0].metadata.name}') -- wget -qO- http://loki:3100/ready
```

### Vérifier Promtail

```bash
# Status des DaemonSets
kubectl get daemonset -n collector-shop promtail

# Pods Promtail (1 par node)
kubectl get pods -n collector-shop -l app=promtail

# Logs de Promtail
kubectl logs -n collector-shop -l app=promtail --tail=50
```

### Tester Loki directement

```bash
# Port-forward Loki (optionnel)
kubectl port-forward -n collector-shop svc/loki 3100:3100

# Requête test (dans un autre terminal)
curl -G -s "http://localhost:3100/loki/api/v1/query" \
  --data-urlencode 'query={namespace="collector-shop"}' \
  --data-urlencode 'limit=10' | jq .
```

## 📊 Métriques Loki disponibles

Loki expose aussi des métriques Prometheus sur `/metrics` :

```bash
# Voir les métriques de Loki
curl http://$(minikube ip):3100/metrics
```

Métriques intéressantes :
- `loki_ingester_chunks_created_total` - Chunks créés
- `loki_ingester_bytes_received_total` - Bytes reçus
- `loki_request_duration_seconds` - Latence des requêtes

## 🎯 Cas d'usage courants

### 1. Debugging d'erreur

```logql
# Chercher une erreur spécifique
{namespace="collector-shop", app="backend"} |= "ECONNREFUSED"

# Voir le contexte autour de l'erreur (5 minutes avant/après)
{namespace="collector-shop", app="backend"} |= "ECONNREFUSED" [5m]
```

### 2. Monitoring des requêtes API

```logql
# Toutes les requêtes HTTP
{namespace="collector-shop", app="backend"} |~ "GET|POST|PUT|DELETE"

# Requêtes avec erreur 500
{namespace="collector-shop", app="backend"} |= "500"

# Temps de réponse > 1s
{namespace="collector-shop", app="backend"} | json | duration > 1s
```

### 3. Analyse de performance

```logql
# Requêtes lentes
{namespace="collector-shop", app="backend"} |= "slow query"

# Peak traffic par minute
sum(rate({namespace="collector-shop", app="backend"}[1m]))
```

### 4. Audit et sécurité

```logql
# Tentatives de connexion échouées
{namespace="collector-shop", app="backend"} |= "authentication failed"

# Accès non autorisés
{namespace="collector-shop"} |~ "403|401|unauthorized"
```

## 🚀 Ajouts au Makefile

J'ai ajouté les commandes suivantes au Makefile :

```bash
# Voir les logs via Loki
make k8s-logs SERVICE=backend

# Accéder à Loki directement (port-forward)
make k8s-port-forward-loki

# Status de Loki
kubectl get pods -n collector-shop -l app=loki
```

## 📈 Avantages de Loki vs logs classiques

| Aspect | Logs classiques | Loki |
|--------|-----------------|------|
| **Centralisation** | ❌ Logs dans chaque pod | ✅ Centralisé |
| **Persistance** | ❌ Perdus au restart | ✅ Stockage persistant |
| **Recherche** | ❌ grep limité | ✅ LogQL puissant |
| **Visualisation** | ❌ CLI uniquement | ✅ Grafana UI |
| **Alerting** | ❌ Pas d'alerte | ✅ Alertes Grafana |
| **Agrégation** | ❌ Manuel | ✅ Automatique |
| **Corrélation** | ❌ Difficile | ✅ Labels K8s |
| **Performance** | ❌ Overhead grep | ✅ Index optimisé |

## 🎓 Pour le jury RNCP

### Points à valoriser :

1. **Observabilité complète** :
   - ✅ Métriques (VictoriaMetrics)
   - ✅ Logs (Loki)
   - 🔄 Traces (à ajouter : Tempo ou Jaeger)

2. **DevSecOps** :
   - Logs centralisés pour audit
   - Détection d'anomalies via logs
   - Traçabilité complète

3. **Architecture de production** :
   - High availability des logs
   - Rétention configurable
   - Scalabilité (Promtail en DaemonSet)

4. **ISO 25010 - Maintainability** :
   - Debugging facilité
   - Analyse de performance
   - Root cause analysis rapide

## 🔒 Sécurité et bonnes pratiques

### Rétention des logs

Configurée dans `loki.yaml` :
```yaml
limits_config:
  retention_period: 30d  # Modifier selon besoin
```

### Filtrage des données sensibles

Dans `promtail.yaml`, ajoutez des pipelines pour masquer les données sensibles :
```yaml
pipeline_stages:
  - regex:
      expression: '(password|token|secret)=([^&\s]+)'
      replace: '${1}=***'
```

### Contrôle d'accès

Pour la production :
- Activer l'authentification Loki
- Utiliser RBAC Kubernetes
- Chiffrer les logs au repos
- Network Policies

## 📚 Ressources

- [Documentation Loki](https://grafana.com/docs/loki/latest/)
- [LogQL Cheat Sheet](https://grafana.com/docs/loki/latest/logql/)
- [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)

## 🎉 Résumé

Votre stack d'observabilité complète :

```
┌─────────────────────────────────────┐
│     Grafana (Visualization)         │
│              :30001                  │
└───────┬──────────────────┬──────────┘
        │                  │
   ┌────▼────┐        ┌────▼────┐
   │  Loki   │        │Victoria │
   │ (Logs)  │        │Metrics  │
   │ :3100   │        │ :8428   │
   └────▲────┘        └────▲────┘
        │                  │
   ┌────┴────┐        ┌────┴────┐
   │Promtail │        │ Backend │
   │(Collect)│        │ /metrics│
   └─────────┘        └─────────┘
```

✅ **Loki est maintenant opérationnel !**

---

**Date** : 21 février 2026  
**Status** : ✅ Déployé et fonctionnel  
**Namespace** : collector-shop
