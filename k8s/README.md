# 🚀 Déploiement Kubernetes avec Minikube - Collector.shop

Ce guide vous permet de déployer Collector.shop sur un cluster Kubernetes local avec Minikube.

---

## 📋 Prérequis

### Outils requis
- **Minikube** ≥ 1.30 ([installer](https://minikube.sigs.k8s.io/docs/start/))
- **kubectl** ≥ 1.28 ([installer](https://kubernetes.io/docs/tasks/tools/))
- **Docker** ≥ 24.0 ([installer](https://docs.docker.com/get-docker/))

### Ressources système recommandées
- **RAM** : 8 Go minimum
- **CPU** : 4 cores minimum
- **Disque** : 40 Go d'espace libre

### Vérifier les installations
```bash
minikube version
kubectl version --client
docker --version
```

---

## 🚀 Démarrage rapide

### 1. Déployer l'application complète
```bash
./deploy-minikube.sh start
```

Cette commande va :
1. ✅ Vérifier les prérequis
2. ✅ Démarrer Minikube (si nécessaire)
3. ✅ Construire les images Docker
4. ✅ Déployer l'infrastructure (PostgreSQL, Redis, MinIO, VictoriaMetrics, Grafana)
5. ✅ Attendre que l'infrastructure soit prête
6. ✅ Déployer l'application (Backend, Frontend)
7. ✅ Exécuter les migrations Prisma
8. ✅ Afficher les URLs d'accès

**Temps estimé** : 5-10 minutes (première fois)

---

## 🔗 Accès aux services

Après le déploiement, les services sont accessibles via :

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Frontend** | http://MINIKUBE_IP:30080 | - |
| **Backend API** | http://MINIKUBE_IP:30000 | - |
| **Backend Health** | http://MINIKUBE_IP:30000/health | - |
| **Backend Metrics** | http://MINIKUBE_IP:30000/metrics | - |
| **Grafana** | http://MINIKUBE_IP:30001 | admin / admin123 |

Pour obtenir l'IP de Minikube :
```bash
minikube ip
```

Ou afficher toutes les URLs :
```bash
./deploy-minikube.sh urls
```

---

## 📊 Commandes disponibles

### Gestion du cluster

```bash
# Démarrer et déployer
./deploy-minikube.sh start

# Afficher le statut
./deploy-minikube.sh status

# Afficher les URLs
./deploy-minikube.sh urls

# Redémarrer les déploiements
./deploy-minikube.sh restart

# Arrêter Minikube
./deploy-minikube.sh stop

# Nettoyer le déploiement
./deploy-minikube.sh clean
```

### Logs

```bash
# Afficher les logs du backend
./deploy-minikube.sh logs backend

# Afficher les logs du frontend
./deploy-minikube.sh logs frontend

# Afficher les logs de PostgreSQL
./deploy-minikube.sh logs postgres
```

### Commandes kubectl utiles

```bash
# Lister tous les pods
kubectl get pods -n collector-shop

# Lister tous les services
kubectl get services -n collector-shop

# Lister tous les deployments
kubectl get deployments -n collector-shop

# Décrire un pod
kubectl describe pod <pod-name> -n collector-shop

# Exec dans un pod
kubectl exec -it <pod-name> -n collector-shop -- /bin/sh

# Port-forward un service
kubectl port-forward -n collector-shop svc/backend 5000:5000
```

---

## 🏗️ Architecture Kubernetes

### Namespaces
- **collector-shop** : Tous les services de l'application

### Composants déployés

#### Infrastructure
1. **PostgreSQL** (1 replica)
   - PVC : 5 Gi
   - Service : ClusterIP
   - Health checks configurés

2. **Redis** (1 replica)
   - PVC : 1 Gi
   - Service : ClusterIP

3. **MinIO** (1 replica)
   - PVC : 10 Gi
   - Service : ClusterIP (ports 9000, 9001)

4. **VictoriaMetrics** (1 replica)
   - PVC : 5 Gi
   - Service : ClusterIP
   - Rétention : 12 mois

5. **Grafana** (1 replica)
   - PVC : 1 Gi
   - Service : NodePort (30001)

#### Application
1. **Backend** (2 replicas)
   - Image : collector-shop-backend:latest
   - Service : NodePort (30000)
   - Resources : 256Mi-512Mi RAM, 250m-500m CPU
   - Init containers : wait-for-postgres, wait-for-redis
   - Health checks : liveness + readiness

2. **Frontend** (2 replicas)
   - Image : collector-shop-frontend:latest
   - Service : NodePort (30080)
   - Resources : 128Mi-256Mi RAM, 100m-200m CPU
   - Health checks : liveness + readiness

---

## 🔧 Configuration

### Secrets
Les secrets sont stockés dans :
- `postgres-secret` : Mot de passe PostgreSQL
- `minio-secret` : Credentials MinIO
- `grafana-secret` : Credentials Grafana
- `backend-secret` : JWT secrets + DATABASE_URL

### ConfigMaps
Les configurations sont dans :
- `postgres-config` : Configuration PostgreSQL
- `backend-config` : Variables d'environnement backend
- `frontend-config` : Variables d'environnement frontend

### Modifier les secrets

```bash
# Éditer les secrets
kubectl edit secret backend-secret -n collector-shop

# Ou recréer depuis un fichier
kubectl delete secret backend-secret -n collector-shop
kubectl create secret generic backend-secret -n collector-shop \
  --from-literal=JWT_SECRET="nouveau-secret" \
  --from-literal=JWT_REFRESH_SECRET="nouveau-refresh-secret" \
  --from-literal=DATABASE_URL="postgresql://..."
```

---

## 🐛 Dépannage

### Minikube ne démarre pas

```bash
# Vérifier le statut
minikube status

# Voir les logs
minikube logs

# Redémarrer Minikube
minikube stop
minikube start
```

### Les pods ne démarrent pas

```bash
# Voir les événements
kubectl get events -n collector-shop --sort-by='.lastTimestamp'

# Décrire un pod problématique
kubectl describe pod <pod-name> -n collector-shop

# Voir les logs
kubectl logs <pod-name> -n collector-shop
```

### Images non trouvées

Les images doivent être construites dans le daemon Docker de Minikube :

```bash
# Utiliser le daemon Docker de Minikube
eval $(minikube docker-env)

# Reconstruire les images
docker build -t collector-shop-backend:latest -f backend/Dockerfile backend/
docker build -t collector-shop-frontend:latest -f frontend/Dockerfile .
```

### Erreurs de migrations

```bash
# Trouver le pod backend
kubectl get pods -n collector-shop -l app=backend

# Exec dans le pod
kubectl exec -it <backend-pod> -n collector-shop -- /bin/sh

# Exécuter les migrations manuellement
npx prisma migrate deploy
npm run prisma:seed
```

### Ressources insuffisantes

Si Minikube manque de ressources :

```bash
# Augmenter les ressources
minikube delete
minikube start --memory=12288 --cpus=6 --disk-size=60g
```

---

## 📈 Monitoring

### Dashboard Kubernetes

```bash
# Activer le dashboard
minikube dashboard
```

### Métriques avec metrics-server

```bash
# Voir les métriques des pods
kubectl top pods -n collector-shop

# Voir les métriques des nodes
kubectl top nodes
```

### Grafana

Accéder à Grafana via http://MINIKUBE_IP:30001

Dashboard pré-configuré avec :
- Métriques P50/P95/P99
- Taux d'erreur
- Requêtes par seconde
- Alertes

---

## 🔄 Mise à jour de l'application

### Backend

```bash
# Reconstruire l'image
eval $(minikube docker-env)
docker build -t collector-shop-backend:latest -f backend/Dockerfile backend/

# Redémarrer le déploiement
kubectl rollout restart deployment backend -n collector-shop

# Suivre le rollout
kubectl rollout status deployment backend -n collector-shop
```

### Frontend

```bash
# Reconstruire l'image
eval $(minikube docker-env)
docker build -t collector-shop-frontend:latest -f frontend/Dockerfile .

# Redémarrer le déploiement
kubectl rollout restart deployment frontend -n collector-shop
```

---

## 🧪 Tests

### Test de charge

```bash
# Port-forward le backend
kubectl port-forward -n collector-shop svc/backend 5000:5000

# Dans un autre terminal, lancer Artillery
cd tests/load-tests
npm run load-test
```

### Health checks

```bash
# Backend health
curl http://$(minikube ip):30000/health

# Backend metrics
curl http://$(minikube ip):30000/metrics

# Frontend
curl http://$(minikube ip):30080
```

---

## 🗑️ Nettoyage

### Supprimer le déploiement

```bash
./deploy-minikube.sh clean
```

### Supprimer complètement Minikube

```bash
minikube delete
```

---

## 📚 Ressources

### Documentation officielle
- [Minikube](https://minikube.sigs.k8s.io/docs/)
- [Kubernetes](https://kubernetes.io/docs/home/)
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)

### Fichiers de configuration
- `k8s/base/` : Manifestes Kubernetes
- `deploy-minikube.sh` : Script de déploiement

---

## 🎯 Différences avec Docker Compose

| Aspect | Docker Compose | Kubernetes/Minikube |
|--------|----------------|---------------------|
| **Scalabilité** | Manuelle | Automatique (replicas) |
| **Health checks** | Basiques | Liveness + Readiness |
| **Ressources** | Non limité | Requests + Limits |
| **Networking** | Bridge simple | Services + Ingress |
| **Storage** | Volumes | PV + PVC |
| **Production-ready** | Non | Oui |

---

## 💡 Conseils

### Développement local
- Utiliser Docker Compose pour le développement local rapide
- Utiliser Minikube pour tester en conditions proches de la production

### CI/CD
- Les manifestes K8s sont prêts pour GitOps (Flux, ArgoCD)
- Les images peuvent être poussées vers un registry (Docker Hub, GCR, ECR)

### Production
- Utiliser un cluster Kubernetes managé (GKE, EKS, AKS)
- Ajouter un Ingress Controller (nginx, traefik)
- Configurer TLS/HTTPS
- Mettre en place HPA (Horizontal Pod Autoscaler)

---

## ✅ Checklist de déploiement

- [ ] Minikube installé et démarré
- [ ] Images Docker construites
- [ ] Infrastructure déployée (PostgreSQL, Redis, MinIO, etc.)
- [ ] Application déployée (Backend, Frontend)
- [ ] Migrations Prisma exécutées
- [ ] Health checks passent
- [ ] Services accessibles
- [ ] Grafana affiche les métriques

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `kubectl logs <pod-name> -n collector-shop`
2. Vérifier les événements : `kubectl get events -n collector-shop`
3. Vérifier le statut : `./deploy-minikube.sh status`
4. Nettoyer et redéployer : `./deploy-minikube.sh clean && ./deploy-minikube.sh start`

---

**Bon déploiement !** 🚀
