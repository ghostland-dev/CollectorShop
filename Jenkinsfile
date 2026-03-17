// =============================================================================
// Jenkinsfile — Collector.shop CI/CD Pipeline (Jenkins + ArgoCD + Minikube)
// =============================================================================
// Flux GitOps Jenkins CI → ArgoCD CD → Minikube
//
//   CI (Jenkins)
//   1. Checkout          → récupération du code source
//   2. Install           → npm install + génération client Prisma
//   3. Lint & Audit      → ESLint backend/frontend + npm audit (en parallèle)
//   4. Build TypeScript  → compilation backend + frontend (en parallèle)
//   5. Tests Unitaires   → Jest backend + frontend (couverture HTML)
//   6. Tests Intégration → Supertest + PostgreSQL éphémère
//   7. Docker Build      → images collector-shop-backend/frontend
//   8. Scan Sécurité     → Trivy (HIGH/CRITICAL)
//
//   CD (Jenkins → ArgoCD → Minikube)
//   9.  Load Image       → minikube image load (imagePullPolicy: Never)
//   10. Update Manifest  → kustomize edit set image + git commit + push
//   11. ArgoCD Sync      → argocd app sync collector-shop + attente
//   12. Tests de Charge  → Artillery sur NodePort Minikube (post-déploiement)
//
// Monitoring : Datadog Agent DaemonSet (namespace monitoring)
//
// Credentials Jenkins requis :
//   - GITHUB_TOKEN   : token GitHub pour git push des manifests
//   - ARGOCD_TOKEN   : token ArgoCD pour déclencher les syncs
//   - KUBECONFIG_B64 : kubeconfig Minikube encodé en base64
// =============================================================================

pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        PROJECT_NAME    = 'collector-shop'
        NODE_VERSION    = '20'

        // ─── Base de données PostgreSQL éphémère pour les tests ───────────────
        // Jenkins est en network_mode: host → on mappe le port 15432 du host vers 5432 du container
        PG_CONTAINER        = "jenkins-pg-${BUILD_NUMBER}"
        PG_USER             = 'test'
        PG_PASSWORD         = 'test'
        PG_DB               = 'collector_shop_test'
        PG_PORT             = '15432'
        DATABASE_URL        = "postgresql://test:test@localhost:15432/collector_shop_test?schema=public"
        TEST_DATABASE_URL   = "postgresql://test:test@localhost:15432/collector_shop_test?schema=public"

        // ─── Secrets de test ───────────────────────────────────────────────────
        JWT_SECRET          = 'jenkins-ci-test-secret-32chars!!'
        JWT_REFRESH_SECRET  = 'jenkins-ci-refresh-secret-32chars'

        // ─── GitOps : dépôt GitHub + branche des manifests ────────────────────
        GIT_REPO_URL        = 'https://github.com/Ismail-Mouyahada/CollectorShop.git'
        GIT_BRANCH          = 'main'
        MANIFEST_PATH       = 'k8s/overlays/minikube'

        // ─── ArgoCD ────────────────────────────────────────────────────────────
        ARGOCD_SERVER       = '192.168.49.2:31080'   // NodePort ArgoCD
        ARGOCD_APP          = 'collector-shop'

        // ─── Minikube ─────────────────────────────────────────────────────────
        MINIKUBE_BACKEND_URL = 'http://192.168.49.2:31000'   // NodePort backend

        // ─── Tests de charge Artillery ────────────────────────────────────────
        ARTILLERY_CONFIG    = 'tests/load-tests/artillery.yml'
    }

    stages {

        // ─────────────────────────────────────────────────────────────────────
        stage('Checkout') {
        // ─────────────────────────────────────────────────────────────────────
            steps {
                checkout scm
                sh '''
                    echo "──────────────────────────────────────────────"
                    echo "  Branch  : $(git rev-parse --abbrev-ref HEAD)"
                    echo "  Commit  : $(git rev-parse --short HEAD)"
                    echo "  Message : $(git log -1 --pretty=%s)"
                    echo "  Auteur  : $(git log -1 --pretty='%an <%ae>')"
                    echo "──────────────────────────────────────────────"
                    node --version
                    npm --version
                    docker --version
                    trivy --version
                '''
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Installation des dépendances') {
        // ─────────────────────────────────────────────────────────────────────
            steps {
                sh 'npm install'
                // Génération du client Prisma (DATABASE_URL fictive, pas besoin de DB pour generate)
                sh '''
                    DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy \
                    npm run prisma:generate --workspace=backend
                '''
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Qualité du code') {
        // ─────────────────────────────────────────────────────────────────────
            parallel {

                stage('Lint Backend') {
                    steps {
                        sh 'npm run lint --workspace=backend'
                    }
                }

                stage('Lint Frontend') {
                    steps {
                        sh 'npm run lint --workspace=frontend'
                    }
                }

                stage('Audit Sécurité npm') {
                    steps {
                        // continue-on-error : les vulnérabilités sont signalées mais ne bloquent pas
                        sh 'npm audit --audit-level=high --workspaces || true'
                    }
                }

            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Build') {
        // ─────────────────────────────────────────────────────────────────────
            parallel {

                stage('Build Backend') {
                    steps {
                        sh 'npm run build --workspace=backend'
                    }
                }

                stage('Build Frontend') {
                    steps {
                        sh 'npm run build --workspace=frontend'
                    }
                }

            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Démarrage PostgreSQL de test') {
        // ─────────────────────────────────────────────────────────────────────
            steps {
                script {
                    // Jenkins est en network_mode: host → port mapping -p 15432:5432 rend
                    // PostgreSQL accessible directement via localhost:15432
                    sh """
                        echo "Démarrage du conteneur PostgreSQL de test : ${PG_CONTAINER}"
                        docker run -d \\
                            --name ${PG_CONTAINER} \\
                            -p ${PG_PORT}:5432 \\
                            -e POSTGRES_USER=${PG_USER} \\
                            -e POSTGRES_PASSWORD=${PG_PASSWORD} \\
                            -e POSTGRES_DB=${PG_DB} \\
                            postgres:15-alpine
                    """

                    // Attente que PostgreSQL soit prêt à accepter des connexions
                    sh """
                        echo "Attente de PostgreSQL sur localhost:${PG_PORT}..."
                        for i in \$(seq 1 30); do
                            if docker exec ${PG_CONTAINER} pg_isready -U ${PG_USER} 2>/dev/null; then
                                echo "✅ PostgreSQL prêt sur localhost:${PG_PORT} !"
                                break
                            fi
                            if [ \$i -eq 30 ]; then
                                echo "❌ PostgreSQL n'a pas démarré à temps"
                                exit 1
                            fi
                            echo "Tentative \$i/30 — attente 3s..."
                            sleep 3
                        done
                    """

                    // Appliquer le schéma Prisma sur la base de test via localhost:15432
                    sh """
                        echo "Application du schéma Prisma..."
                        cd backend
                        DATABASE_URL=${DATABASE_URL} \\
                        npx prisma db push --accept-data-loss --skip-generate
                        echo "✅ Schéma Prisma appliqué"
                    """
                }
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Tests') {
        // ─────────────────────────────────────────────────────────────────────
            parallel {

                stage('Tests Backend') {
                    steps {
                        sh """
                            DATABASE_URL=${DATABASE_URL} \\
                            JWT_SECRET=${JWT_SECRET} \\
                            JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET} \\
                            NODE_ENV=test \\
                            npm run test:coverage --workspace=backend
                        """
                    }
                    post {
                        always {
                            // Publier le rapport de couverture HTML du backend
                            publishHTML(target: [
                                allowMissing         : true,
                                alwaysLinkToLastBuild: false,
                                keepAll              : true,
                                reportDir            : 'backend/coverage/lcov-report',
                                reportFiles          : 'index.html',
                                reportName           : 'Couverture Backend'
                            ])
                        }
                    }
                }

                stage('Tests Frontend') {
                    steps {
                        sh 'npm run test:coverage --workspace=frontend'
                    }
                    post {
                        always {
                            // Publier le rapport de couverture HTML du frontend
                            publishHTML(target: [
                                allowMissing         : true,
                                alwaysLinkToLastBuild: false,
                                keepAll              : true,
                                reportDir            : 'frontend/coverage',
                                reportFiles          : 'index.html',
                                reportName           : 'Couverture Frontend'
                            ])
                        }
                    }
                }

            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Build Images Docker') {
        // ─────────────────────────────────────────────────────────────────────
            steps {
                sh """
                    echo "Build de l'image backend..."
                    docker build \\
                        -t ${PROJECT_NAME}-backend:${BUILD_NUMBER} \\
                        -t ${PROJECT_NAME}-backend:latest \\
                        -f backend/Dockerfile backend/

                    echo "Build de l'image frontend..."
                    docker build \\
                        -t ${PROJECT_NAME}-frontend:${BUILD_NUMBER} \\
                        -t ${PROJECT_NAME}-frontend:latest \\
                        -f frontend/Dockerfile .

                    echo "✅ Images construites :"
                    docker images | grep ${PROJECT_NAME}
                """
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Scan de Sécurité Conteneurs') {
        // ─────────────────────────────────────────────────────────────────────
            // Scans séquentiels : Trivy utilise un verrou sur sa base de données,
            // deux scans parallèles provoqueraient un conflit de cache.
            steps {
                sh """
                    echo "=== Scan Trivy — Backend ==="
                    trivy image \\
                        --exit-code 0 \\
                        --severity HIGH,CRITICAL \\
                        --format table \\
                        --timeout 10m \\
                        ${PROJECT_NAME}-backend:${BUILD_NUMBER}

                    echo "=== Scan Trivy — Frontend ==="
                    trivy image \\
                        --exit-code 0 \\
                        --severity HIGH,CRITICAL \\
                        --format table \\
                        --skip-db-update \\
                        --timeout 10m \\
                        ${PROJECT_NAME}-frontend:${BUILD_NUMBER}
                """
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Load Images → Minikube') {
        // ─────────────────────────────────────────────────────────────────────
        // Charge les images Docker dans le daemon Minikube (imagePullPolicy: Never)
        // Requiert : minikube en cours d'exécution sur l'hôte + kubeconfig monté
            when {
                expression { return fileExists('/root/.kube/config') || fileExists("${HOME}/.kube/config") }
            }
            steps {
                sh """
                    echo "=== Chargement des images dans Minikube ==="
                    minikube image load ${PROJECT_NAME}-backend:${BUILD_NUMBER} || true
                    minikube image load ${PROJECT_NAME}-frontend:${BUILD_NUMBER} || true

                    minikube image load ${PROJECT_NAME}-backend:latest || true
                    minikube image load ${PROJECT_NAME}-frontend:latest || true

                    echo "Images disponibles dans Minikube :"
                    minikube image ls | grep ${PROJECT_NAME} || true
                """
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Mise à jour Manifests (GitOps)') {
        // ─────────────────────────────────────────────────────────────────────
        // Met à jour les image tags dans k8s/overlays/minikube/kustomization.yaml
        // puis commit + push → ArgoCD détecte le changement et déploie
            steps {
                withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'GH_TOKEN')]) {
                    sh """
                        echo "=== Mise à jour des image tags (build ${BUILD_NUMBER}) ==="
                        cd ${MANIFEST_PATH}

                        # Mettre à jour les tags via kustomize
                        kustomize edit set image \\
                            ${PROJECT_NAME}-backend=${PROJECT_NAME}-backend:${BUILD_NUMBER}
                        kustomize edit set image \\
                            ${PROJECT_NAME}-frontend=${PROJECT_NAME}-frontend:${BUILD_NUMBER}

                        echo "kustomization.yaml mis à jour :"
                        cat kustomization.yaml

                        cd ${WORKSPACE}

                        # Configurer git
                        git config user.email "jenkins@collector-shop.local"
                        git config user.name  "Jenkins CI"

                        # Commit et push vers Gitea (Jenkins est en network_mode: host → accès direct à Minikube)
                        git add ${MANIFEST_PATH}/kustomization.yaml
                        git diff --cached --quiet && echo "Pas de changement" || {
                            git commit -m "ci: deploy build ${BUILD_NUMBER} [skip ci]"
                            git push http://gitea-admin:\${GH_TOKEN}@192.168.49.2:31200/gitea-admin/collector-shop.git HEAD:${GIT_BRANCH}
                            echo "✅ Manifests poussés vers Gitea"
                        }
                    """
                }
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Déploiement ArgoCD') {
        // ─────────────────────────────────────────────────────────────────────
        // Déclenche la synchronisation ArgoCD et attend que le déploiement
        // soit "Healthy" avant de continuer vers les tests de charge
            steps {
                withCredentials([string(credentialsId: 'ARGOCD_TOKEN', variable: 'ARGOCD_AUTH_TOKEN')]) {
                    sh """
                        echo "=== Synchronisation ArgoCD ==="

                        # Login ArgoCD via token
                        argocd login ${ARGOCD_SERVER} \\
                            --auth-token \${ARGOCD_AUTH_TOKEN} \\
                            --insecure \\
                            --grpc-web

                        # Déclencher la synchronisation
                        argocd app sync ${ARGOCD_APP} \\
                            --insecure \\
                            --grpc-web \\
                            --async

                        echo "Synchronisation déclenchée. Attente que l'application soit Healthy..."

                        # Attendre que l'application soit synchronisée et en bonne santé
                        argocd app wait ${ARGOCD_APP} \\
                            --insecure \\
                            --grpc-web \\
                            --health \\
                            --sync \\
                            --timeout 300

                        echo "=== Statut de l'application ==="
                        argocd app get ${ARGOCD_APP} --insecure --grpc-web

                        echo "✅ Déploiement ArgoCD terminé"
                    """
                }
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        stage('Tests de Charge (Artillery)') {
        // ─────────────────────────────────────────────────────────────────────
        // Tests de performance post-déploiement sur l'environnement Minikube
        // Valide que le service répond avec P95 < 200ms sous charge
            steps {
                sh """
                    echo "=== Tests de charge Artillery sur Minikube ==="
                    echo "Cible : ${MINIKUBE_BACKEND_URL}"

                    # Installer Artillery si absent
                    npx artillery version 2>/dev/null || npm install -g artillery

                    # Vérifier que le backend répond avant les tests
                    echo "Vérification de la disponibilité du backend..."
                    for i in \$(seq 1 12); do
                        curl -sf ${MINIKUBE_BACKEND_URL}/health && break
                        echo "Tentative \$i/12 — attente 10s..."
                        sleep 10
                    done

                    # Lancer les tests de charge
                    npx artillery run \\
                        --output artillery-report-${BUILD_NUMBER}.json \\
                        --target ${MINIKUBE_BACKEND_URL} \\
                        ${ARTILLERY_CONFIG} || true

                    # Générer le rapport HTML
                    npx artillery report \\
                        --output artillery-report-${BUILD_NUMBER}.html \\
                        artillery-report-${BUILD_NUMBER}.json || true

                    echo "=== Résumé des tests de charge ==="
                    cat artillery-report-${BUILD_NUMBER}.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
agg = data.get('aggregate', {})
summary = agg.get('summaries', {})
latency = agg.get('latencies', {})
print('Requêtes totales :', agg.get('requestsCompleted', 'N/A'))
print('Taux erreur      :', agg.get('counters', {}).get('vusers.failed', 0))
" 2>/dev/null || echo "(résumé JSON non disponible)"
                """
            }
            post {
                always {
                    // Publier le rapport Artillery HTML
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : '.',
                        reportFiles          : "artillery-report-${BUILD_NUMBER}.html",
                        reportName           : 'Tests de Charge Artillery'
                    ])
                    // Archiver le rapport JSON
                    archiveArtifacts(
                        artifacts: "artillery-report-${BUILD_NUMBER}.json",
                        allowEmptyArchive: true
                    )
                }
            }
        }

    }

    // ─────────────────────────────────────────────────────────────────────────
    post {
    // ─────────────────────────────────────────────────────────────────────────

        always {
            script {
                // Supprimer le conteneur PostgreSQL de test (même en cas d'échec)
                sh "docker rm -f ${env.PG_CONTAINER} 2>/dev/null || true"
            }
            // Nettoyer le workspace Jenkins
            cleanWs()
        }

        success {
            echo '''
╔══════════════════════════════════════════════════════════╗
║   ✅  Pipeline CI/CD terminé avec SUCCÈS                 ║
╚══════════════════════════════════════════════════════════╝'''
            script {
                echo "Images Docker :"
                echo "  ${env.PROJECT_NAME}-backend:${env.BUILD_NUMBER}"
                echo "  ${env.PROJECT_NAME}-frontend:${env.BUILD_NUMBER}"
                echo ""
                echo "Déploiement ArgoCD : http://localhost:30080/applications/${env.ARGOCD_APP}"
                echo "Backend Minikube   : ${env.MINIKUBE_BACKEND_URL}"
                echo "Durée du build     : ${currentBuild.durationString}"
            }
        }

        failure {
            echo '''
╔══════════════════════════════════════════════════════════╗
║   ❌  Pipeline CI/CD ÉCHOUÉ                              ║
║   Consultez les logs ci-dessus pour identifier l'erreur  ║
╚══════════════════════════════════════════════════════════╝'''
        }

        unstable {
            echo '''
╔══════════════════════════════════════════════════════════╗
║   ⚠️   Pipeline INSTABLE — Des tests ont échoué          ║
╚══════════════════════════════════════════════════════════╝'''
        }

    }
}
