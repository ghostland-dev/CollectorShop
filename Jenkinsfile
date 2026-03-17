// =============================================================================
// Jenkinsfile — Collector.shop CI/CD Pipeline (Local)
// =============================================================================
// Équivalent du workflow GitHub Actions .github/workflows/ci-cd.yml
//
// Étapes du pipeline :
//   1. Checkout          → récupération du code source
//   2. Install           → npm install + génération client Prisma
//   3. Lint & Audit      → ESLint backend/frontend + npm audit (en parallèle)
//   4. Build             → compilation TypeScript backend + frontend (en parallèle)
//   5. Tests             → tests unitaires backend + frontend avec couverture (en parallèle)
//   6. Docker Build      → construction des images Docker
//   7. Scan Sécurité     → Trivy sur les deux images (en parallèle)
//
// Prérequis sur le container Jenkins :
//   - Node.js 20
//   - Docker CLI (accès au socket Docker hôte)
//   - Trivy
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

        // Base de données PostgreSQL éphémère pour les tests
        // Le conteneur est sur le réseau jenkins-ci-net, accessible par son nom
        PG_CONTAINER        = "jenkins-pg-${BUILD_NUMBER}"
        PG_USER             = 'test'
        PG_PASSWORD         = 'test'
        PG_DB               = 'collector_shop_test'
        // DATABASE_URL utilisée pour prisma db push (CLI) et génération
        DATABASE_URL        = "postgresql://test:test@jenkins-pg-${BUILD_NUMBER}:5432/collector_shop_test?schema=public"
        // TEST_DATABASE_URL est lue par backend/src/__tests__/setup.ts
        // qui l'injecte dans process.env.DATABASE_URL pour Jest
        TEST_DATABASE_URL   = "postgresql://test:test@jenkins-pg-${BUILD_NUMBER}:5432/collector_shop_test?schema=public"

        // Secrets de test (uniquement pour CI — pas de valeur en production)
        JWT_SECRET          = 'jenkins-ci-test-secret-32chars!!'
        JWT_REFRESH_SECRET  = 'jenkins-ci-refresh-secret-32chars'
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
                    // Démarrer un conteneur PostgreSQL éphémère sur le réseau jenkins-ci-net
                    // Jenkins (sur le même réseau) pourra y accéder via son nom de conteneur
                    sh """
                        echo "Démarrage du conteneur PostgreSQL de test : ${PG_CONTAINER}"
                        docker run -d \\
                            --name ${PG_CONTAINER} \\
                            --network jenkins-ci-net \\
                            -e POSTGRES_USER=${PG_USER} \\
                            -e POSTGRES_PASSWORD=${PG_PASSWORD} \\
                            -e POSTGRES_DB=${PG_DB} \\
                            postgres:15-alpine
                    """

                    // Attente que PostgreSQL soit prêt à accepter des connexions
                    sh """
                        echo "Attente de PostgreSQL..."
                        for i in \$(seq 1 30); do
                            if docker exec ${PG_CONTAINER} pg_isready -U ${PG_USER} 2>/dev/null; then
                                echo "✅ PostgreSQL prêt !"
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

                    // Appliquer le schéma Prisma sur la base de test
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
                echo "Images Docker disponibles localement :"
                echo "  ${env.PROJECT_NAME}-backend:${env.BUILD_NUMBER}"
                echo "  ${env.PROJECT_NAME}-frontend:${env.BUILD_NUMBER}"
                echo ""
                echo "Durée du build : ${currentBuild.durationString}"
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
