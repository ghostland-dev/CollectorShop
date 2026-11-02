# Guide de Monitoring - Collector.shop

## Architecture de Monitoring

Le POC utilise VictoriaMetrics pour le stockage des métriques et Grafana pour la visualisation.

### Services

1. VictoriaMetrics : Base de données de séries temporelles haute performance (remplace Prometheus)
2. Grafana : Plateforme de visualisation et d'alerting open source

### Pourquoi VictoriaMetrics au lieu de Prometheus ?

VictoriaMetrics est une alternative à Prometheus qui offre :
- Compatibilité 100% avec l'API Prometheus (PromQL)
- Performance supérieure : jusqu'à 20x plus rapide
- Consommation mémoire réduite
- Compression optimisée du stockage
- API identique : Grafana fonctionne sans modification

Architecture simplifiée :
```
Backend (/metrics) → VictoriaMetrics → Grafana
```

Au lieu de :
```
Backend (/metrics) → Prometheus → Grafana
```

Pas besoin de Prometheus car VictoriaMetrics :
- Accepte les métriques au format Prometheus
- Supporte les requêtes PromQL
- Est compatible avec tous les outils Prometheus (Grafana, Alertmanager, etc.)

## Accès aux Services

### VictoriaMetrics

- API : http://localhost:8428
- Health Check : http://localhost:8428/health
- Metrics Query : http://localhost:8428/api/v1/query?query=up
- Metrics Import : http://localhost:8428/api/v1/import/prometheus

### Grafana

- Interface Web : http://localhost:3001
- Identifiants par défaut :
  - Username: admin
  - Password: admin123

Important : Changez le mot de passe après la première connexion en production.

## Métriques Collectées

Le backend expose des métriques Prometheus sur `/metrics` :

### Métriques HTTP

- `http_requests_total` : Nombre total de requêtes HTTP (labels: method, route, status)
- `http_request_duration_seconds` : Durée des requêtes HTTP (histogram)
- `http_errors_total` : Nombre total d'erreurs HTTP

### Métriques de Connexion

- `active_connections` : Nombre de connexions actives

### Métriques de Base de Données

- `database_query_duration_seconds` : Durée des requêtes DB (histogram, labels: operation, table)

### Métriques de Cache

- `cache_hits_total` : Nombre de hits de cache
- `cache_misses_total` : Nombre de misses de cache

## Configuration

### Backend

Les métriques sont automatiquement poussées vers VictoriaMetrics toutes les 15 secondes.

Variable d'environnement :
```env
VICTORIAMETRICS_URL=http://victoriametrics:8428/api/v1/import/prometheus
```

### Grafana

Grafana est configuré automatiquement avec :
- Source de données : VictoriaMetrics (provisionnée automatiquement)
- Dashboard : Dashboard Collector.shop (chargé automatiquement)

Les fichiers de configuration se trouvent dans :
- `grafana/provisioning/datasources/` : Configuration de la source de données
- `grafana/dashboards/` : Dashboards JSON

## Utilisation

### 1. Démarrer les Services

```bash
docker-compose up -d
```

### 2. Accéder à Grafana

1. Ouvrir http://localhost:3001
2. Se connecter avec `admin` / `admin123`
3. Le dashboard "Collector.shop - Monitoring" devrait être disponible

### 3. Visualiser les Métriques

Le dashboard inclut :
- Requêtes HTTP par seconde : Taux de requêtes
- Temps de réponse (P50, P95) : Latence des requêtes
- Taux d'erreurs HTTP : Erreurs par seconde
- Requêtes par route : Répartition des requêtes
- Connexions actives : Nombre de connexions simultanées
- Durée des requêtes DB : Performance de la base de données
- Cache Hits/Misses : Efficacité du cache

### 4. Requêtes PromQL Exemples

#### Nombre total de requêtes
```promql
sum(http_requests_total)
```

#### Taux de requêtes par seconde
```promql
rate(http_requests_total[5m])
```

#### Temps de réponse P95
```promql
histogram_quantile(0.95, http_request_duration_seconds_bucket)
```

#### Taux d'erreurs
```promql
rate(http_errors_total[5m])
```

#### Requêtes par route
```promql
sum by (route) (rate(http_requests_total[5m]))
```

#### Taux de succès
```promql
sum(rate(http_requests_total{status=~"2.."}[5m])) / sum(rate(http_requests_total[5m]))
```

## Endpoints API

### Backend - Métriques Prometheus

```bash
curl http://localhost:5000/metrics
```

### VictoriaMetrics - Query

```bash
# Liste des métriques
curl "http://localhost:8428/api/v1/label/__name__/values"

# Requête spécifique
curl "http://localhost:8428/api/v1/query?query=up"

# Requête de plage
curl "http://localhost:8428/api/v1/query_range?query=rate(http_requests_total[5m])&start=$(date -d '1 hour ago' +%s)&end=$(date +%s)&step=15s"
```

## Dépannage

### VictoriaMetrics ne démarre pas

Vérifier les logs :
```bash
docker-compose logs victoriametrics
```

Vérifier le health check :
```bash
curl http://localhost:8428/health
```

### Grafana ne se connecte pas à VictoriaMetrics

1. Vérifier que VictoriaMetrics est démarré :
   ```bash
   docker-compose ps victoriametrics
   ```

2. Vérifier la configuration dans Grafana :
   - Settings → Data Sources → VictoriaMetrics
   - URL doit être : `http://victoriametrics:8428`

3. Tester la connexion depuis Grafana

### Pas de métriques dans Grafana

1. Vérifier que le backend pousse les métriques :
   ```bash
   docker-compose logs backend | grep -i metrics
   ```

2. Vérifier les métriques directement :
   ```bash
   curl http://localhost:5000/metrics
   ```

3. Vérifier que VictoriaMetrics reçoit les données :
   ```bash
   curl "http://localhost:8428/api/v1/query?query=up"
   ```

## Personnalisation

### Ajouter un Dashboard

1. Créer un fichier JSON dans `grafana/dashboards/`
2. Redémarrer Grafana ou attendre le rafraîchissement automatique (10s)

### Modifier la Source de Données

Éditer `grafana/provisioning/datasources/victoriametrics.yml` et redémarrer Grafana.

## Production

Recommandations pour la production :

1. Sécurité
   - Changer les mots de passe par défaut
   - Configurer l'authentification LDAP/OAuth si nécessaire
   - Utiliser HTTPS

2. Performance
   - Ajuster la rétention des données (--retentionPeriod)
   - Configurer des alertes dans Grafana
   - Surveiller l'espace disque

3. Haute Disponibilité
   - Utiliser VictoriaMetrics Cluster en production
   - Configurer la réplication des données
   - Mettre en place des sauvegardes
