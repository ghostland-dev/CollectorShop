# Guide des commandes Kubernetes via Makefile

Ce document présente toutes les commandes Kubernetes disponibles dans le Makefile pour gérer le déploiement Minikube.

## 📋 Table des matières

- [Démarrage rapide](#démarrage-rapide)
- [Gestion du cycle de vie](#gestion-du-cycle-de-vie)
- [Surveillance et debugging](#surveillance-et-debugging)
- [Manipulation des pods](#manipulation-des-pods)
- [Déploiement et mises à jour](#déploiement-et-mises-à-jour)
- [Scaling](#scaling)
- [Port forwarding](#port-forwarding)
- [Base de données](#base-de-données)
- [Métriques et informations](#métriques-et-informations)

## 🚀 Démarrage rapide

### Première installation

```bash
# 1. Démarrer Minikube et déployer l'application
make k8s-start

# 2. Vérifier le statut
make k8s-status

# 3. Obtenir les URLs d'accès
make k8s-urls
```

### URLs d'accès (exemple)

- **Frontend**: http://192.168.49.2:30080
- **Backend API**: http://192.168.49.2:30000
- **Backend Health**: http://192.168.49.2:30000/health
- **Backend Metrics**: http://192.168.49.2:30000/metrics
- **Grafana**: http://192.168.49.2:30001 (admin / admin123)

## 🔄 Gestion du cycle de vie

### Démarrage et arrêt

```bash
# Démarrer le cluster et déployer
make k8s-start

# Arrêter le cluster Minikube
make k8s-stop

# Redémarrer les déploiements
make k8s-restart
```

### Nettoyage

```bash
# Nettoyer complètement le déploiement
make k8s-clean
```

## 👀 Surveillance et debugging

### Statut général

```bash
# Voir le statut complet (pods, services, deployments)
make k8s-status

# Lister uniquement les pods
make k8s-pods

# Lister uniquement les services
make k8s-services

# Lister uniquement les déploiements
make k8s-deployments

# Lister les PersistentVolumeClaims
make k8s-pvc
```

### Logs

```bash
# Voir les logs du backend
make k8s-logs SERVICE=backend

# Voir les logs du frontend
make k8s-logs SERVICE=frontend

# Voir les logs de PostgreSQL
make k8s-logs SERVICE=postgres

# Voir les logs de Redis
make k8s-logs SERVICE=redis

# Voir les logs de MinIO
make k8s-logs SERVICE=minio

# Voir les logs de VictoriaMetrics
make k8s-logs SERVICE=victoriametrics

# Voir les logs de Grafana
make k8s-logs SERVICE=grafana
```

### Événements et détails

```bash
# Voir les événements récents
make k8s-events

# Décrire un pod spécifique (remplacer <pod-name>)
make k8s-describe-pod POD=backend-7b44dc9896-4g92m
```

## 🖥️ Manipulation des pods

### Shells interactifs

```bash
# Ouvrir un shell dans le conteneur backend
make k8s-shell-backend

# Ouvrir un shell PostgreSQL
make k8s-shell-db
```

### Dashboard Kubernetes

```bash
# Ouvrir le dashboard Kubernetes
make k8s-dashboard
```

## 🔨 Déploiement et mises à jour

### Rebuild et redéploiement

```bash
# Rebuilder et redéployer le backend
make k8s-rebuild-backend

# Rebuilder et redéployer le frontend
make k8s-rebuild-frontend
```

Ces commandes :
1. Compilent une nouvelle image Docker en utilisant le daemon de Minikube
2. Redémarrent automatiquement les déploiements avec la nouvelle image

## 📈 Scaling

### Ajuster le nombre de replicas

```bash
# Scaler le backend à 3 instances
make k8s-scale-backend REPLICAS=3

# Scaler le frontend à 4 instances
make k8s-scale-frontend REPLICAS=4

# Revenir à 2 instances (configuration par défaut)
make k8s-scale-backend REPLICAS=2
make k8s-scale-frontend REPLICAS=2
```

## 🔀 Port forwarding

Utile pour accéder aux services depuis `localhost` sans passer par NodePort :

```bash
# Port-forward backend (accessible sur http://localhost:5000)
make k8s-port-forward-backend

# Port-forward frontend (accessible sur http://localhost:3000)
make k8s-port-forward-frontend

# Port-forward Grafana (accessible sur http://localhost:3001)
make k8s-port-forward-grafana
```

**Note**: Ces commandes bloquent le terminal. Utilisez `Ctrl+C` pour arrêter.

## 🗄️ Base de données

### Migrations et seed

```bash
# Exécuter les migrations Prisma
make k8s-migrate

# Seed la base de données
make k8s-seed
```

## 📊 Métriques et informations

### Métriques de ressources

```bash
# Voir l'utilisation CPU/RAM des pods
make k8s-top

# Voir l'utilisation CPU/RAM des nodes
make k8s-top-nodes
```

### Informations système

```bash
# Afficher les informations du cluster
make k8s-info

# Afficher les URLs d'accès
make k8s-urls
```

## 🎯 Workflows courants

### Développement rapide

```bash
# 1. Modifier le code backend
# 2. Rebuilder et redéployer
make k8s-rebuild-backend

# 3. Vérifier les logs
make k8s-logs SERVICE=backend

# 4. Tester l'API
curl http://$(minikube ip):30000/health
```

### Debug d'un problème

```bash
# 1. Vérifier le statut
make k8s-status

# 2. Identifier le pod problématique
make k8s-pods

# 3. Voir les logs
make k8s-logs SERVICE=backend

# 4. Décrire le pod pour plus de détails
make k8s-describe-pod POD=<pod-name>

# 5. Voir les événements récents
make k8s-events
```

### Test de montée en charge

```bash
# 1. Scaler l'application
make k8s-scale-backend REPLICAS=5
make k8s-scale-frontend REPLICAS=5

# 2. Vérifier les métriques
make k8s-top

# 3. Faire des tests de charge
# (utiliser Artillery, k6, ou autre outil)

# 4. Revenir à la normale
make k8s-scale-backend REPLICAS=2
make k8s-scale-frontend REPLICAS=2
```

### Mise à jour complète

```bash
# 1. Rebuilder tout
make k8s-rebuild-backend
make k8s-rebuild-frontend

# 2. Exécuter les migrations si nécessaire
make k8s-migrate

# 3. Vérifier le statut
make k8s-status

# 4. Tester les endpoints
make k8s-urls
```

## 🛠️ Troubleshooting

### Les pods ne démarrent pas

```bash
# Vérifier les événements
make k8s-events

# Décrire le pod
make k8s-describe-pod POD=<pod-name>

# Voir les logs d'init containers
kubectl logs -n collector-shop <pod-name> -c wait-for-postgres
kubectl logs -n collector-shop <pod-name> -c wait-for-redis
```

### Problèmes de connexion

```bash
# Vérifier que les services sont bien exposés
make k8s-services

# Vérifier l'IP de Minikube
make k8s-info

# Tester les endpoints
curl http://$(minikube ip):30000/health
curl http://$(minikube ip):30080
```

### Problèmes de performance

```bash
# Vérifier l'utilisation des ressources
make k8s-top
make k8s-top-nodes

# Vérifier les limites dans les déploiements
kubectl describe deployment backend -n collector-shop
```

### Reset complet

```bash
# Si tout va mal, reset complet
make k8s-clean
make k8s-start
```

## 📚 Ressources supplémentaires

- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [Documentation Minikube](https://minikube.sigs.k8s.io/docs/)
- [Documentation Kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [Guide Kubernetes local](./k8s/README.md)

## 💡 Astuces

### Aliases utiles

Ajoutez ces aliases dans votre `~/.bashrc` ou `~/.zshrc` :

```bash
alias k='kubectl'
alias mk='minikube'
alias kn='kubectl config set-context --current --namespace=collector-shop'
alias kgp='kubectl get pods -n collector-shop'
alias kgs='kubectl get services -n collector-shop'
alias kgd='kubectl get deployments -n collector-shop'
alias klogs='kubectl logs -n collector-shop --tail=100 -f'
```

### Commandes kubectl directes

Si vous préférez utiliser `kubectl` directement :

```bash
# Tous les pods
kubectl get pods -n collector-shop

# Logs en temps réel
kubectl logs -n collector-shop -f <pod-name>

# Décrire une ressource
kubectl describe pod <pod-name> -n collector-shop

# Port-forward
kubectl port-forward -n collector-shop svc/backend 5000:5000
```

### Accéder aux services via minikube

```bash
# Lister tous les services
minikube service list -n collector-shop

# Ouvrir un service dans le navigateur
minikube service backend -n collector-shop
minikube service frontend -n collector-shop
minikube service grafana -n collector-shop
```

## 🎓 Prochaines étapes

Une fois le déploiement Minikube maîtrisé, vous pouvez :

1. **Expérimenter avec Helm** pour packager l'application
2. **Ajouter un Ingress** pour router le trafic HTTP
3. **Implémenter des HorizontalPodAutoscalers** pour le scaling automatique
4. **Configurer des NetworkPolicies** pour la sécurité réseau
5. **Ajouter des PodDisruptionBudgets** pour la haute disponibilité
6. **Migrer vers un cluster de production** (EKS, GKE, AKS)

---

**Dernière mise à jour** : 21 février 2026
**Version Kubernetes** : Compatible avec Minikube v1.32+ et Kubernetes v1.28+
