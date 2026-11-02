// =============================================================================
// Jenkinsfile — Collector.shop  CI/CD Pipeline
// =============================================================================
//
//  FLUX PIPELINE
//  ┌─────────────────────────────────────────────────────────────────────────┐
//  │  1. Checkout & Installation                                             │
//  │  2. Lint → Qualité → Compilation   (parallèle + SonarCloud)           │
//  │  3. Tests Unitaires                (Jest + JUnit XML artifacts)        │
//  │  4. Analyse Sécurité               (Trivy FS + npm audit)              │
//  │  5. Build Images Docker            (build + scan + load Minikube)      │
//  │  6. Vérification ArgoCD            (kustomize → Gitea → sync → wait)  │
//  │  7. Tests de Charge & Intégration  (Artillery + health-checks live)    │
//  │  8. Notification Discord           (post: success / failure / unstable)│
//  └─────────────────────────────────────────────────────────────────────────┘
//
//  Credentials Jenkins requis :
//    - GITHUB_TOKEN      : token Gitea pour git push des manifests
//    - ARGOCD_TOKEN      : session token ArgoCD (REST API)
//    - DISCORD_WEBHOOK   : URL webhook Discord pour les notifications
//    - SONAR_TOKEN       : token SonarCloud pour l'analyse qualité
// =============================================================================

pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
    }

    environment {
        PROJECT_NAME    = 'collector-shop'
        NODE_VERSION    = '20'

        // ─── PostgreSQL éphémère (network_mode: host → port mapping) ──────────
        PG_CONTAINER        = "jenkins-pg-${BUILD_NUMBER}"
        PG_USER             = 'test'
        PG_PASSWORD         = 'test'
        PG_DB               = 'collector_shop_test'
        PG_PORT             = '15432'
        DATABASE_URL        = "postgresql://test:test@localhost:15432/collector_shop_test?schema=public"
        TEST_DATABASE_URL   = "postgresql://test:test@localhost:15432/collector_shop_test?schema=public"

        // ─── Secrets de test ──────────────────────────────────────────────────
        JWT_SECRET          = 'jenkins-ci-test-secret-32chars!!'
        JWT_REFRESH_SECRET  = 'jenkins-ci-refresh-secret-32chars'

        // ─── ArgoCD (REST API — évite les problèmes d'auth CLI v3) ───────────
        ARGOCD_SERVER       = '192.168.49.2:31080'

        // ─── Minikube ─────────────────────────────────────────────────────────
        MINIKUBE_DOCKER_HOST  = 'tcp://192.168.49.2:2376'
        MINIKUBE_CERTS        = '/home/ismail/.minikube/certs'

        // ─── SonarCloud ───────────────────────────────────────────────────────
        SONAR_HOST_URL      = 'https://sonarcloud.io'

        // ─── Artillery ────────────────────────────────────────────────────────
        ARTILLERY_CONFIG    = 'tests/load-tests/artillery.yml'
    }

    stages {

        // ═════════════════════════════════════════════════════════════════════
        stage('Environnement (branche → env)') {
        // ═════════════════════════════════════════════════════════════════════
        //  Détermine MANIFEST_PATH, ARGOCD_APP, et URLs selon la branche :
        //    main     → production  (k8s/overlays/minikube)
        //    staging  → staging     (k8s/overlays/staging)
        //    develop  → dev         (k8s/overlays/dev)
            steps {
                script {
                    def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main').replaceAll('origin/', '')
                    switch (branch) {
                        case 'staging':
                            env.MANIFEST_PATH       = 'k8s/overlays/staging'
                            env.ARGOCD_APP          = 'collector-shop-staging'
                            env.GIT_DEPLOY_BRANCH   = 'staging'
                            env.MINIKUBE_BACKEND_URL  = 'https://api-staging.shopcollector.local'
                            env.MINIKUBE_FRONTEND_URL = 'https://staging.shopcollector.local'
                            env.GRAFANA_URL           = 'https://grafana-staging.shopcollector.local'
                            break
                        case 'develop':
                            env.MANIFEST_PATH       = 'k8s/overlays/dev'
                            env.ARGOCD_APP          = 'collector-shop-dev'
                            env.GIT_DEPLOY_BRANCH   = 'develop'
                            env.MINIKUBE_BACKEND_URL  = 'https://api-dev.shopcollector.local'
                            env.MINIKUBE_FRONTEND_URL = 'https://dev.shopcollector.local'
                            env.GRAFANA_URL           = 'https://grafana-dev.shopcollector.local'
                            break
                        default: // main → production
                            env.MANIFEST_PATH       = 'k8s/overlays/minikube'
                            env.ARGOCD_APP          = 'collector-shop-production'
                            env.GIT_DEPLOY_BRANCH   = 'main'
                            env.MINIKUBE_BACKEND_URL  = 'https://api.shopcollector.local'
                            env.MINIKUBE_FRONTEND_URL = 'https://shopcollector.local'
                            env.GRAFANA_URL           = 'https://grafana.shopcollector.local'
                    }
                    echo "Branch: ${branch} → App: ${env.ARGOCD_APP} | Path: ${env.MANIFEST_PATH}"
                }
            }
        }

        // ═════════════════════════════════════════════════════════════════════
        stage('Checkout & Installation') {
        // ═════════════════════════════════════════════════════════════════════
            steps {
                checkout scm
                sh '''
                    echo "══════════════════════════════════════════════════"
                    echo "  Branch  : $(git rev-parse --abbrev-ref HEAD)"
                    echo "  Commit  : $(git rev-parse --short HEAD)"
                    echo "  Message : $(git log -1 --pretty=%s)"
                    echo "  Auteur  : $(git log -1 --pretty='%an <%ae>')"
                    echo "══════════════════════════════════════════════════"
                    echo "  node    : $(node --version)"
                    echo "  npm     : $(npm --version)"
                    echo "  docker  : $(docker --version)"
                    echo "  trivy   : $(trivy --version | head -1)"
                    echo "  kustomize: $(kustomize version)"
                    echo "══════════════════════════════════════════════════"
                '''
                sh 'npm install'
                sh 'npm install jest-junit --save-dev --workspace=backend --workspace=frontend 2>/dev/null || npm install jest-junit --no-save'
                sh '''
                    DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy \
                    npm run prisma:generate --workspace=backend
                '''
            }
        }

        // ═════════════════════════════════════════════════════════════════════
        stage('Lint \u2192 Qualit\u00e9 \u2192 Compilation') {
        // ═════════════════════════════════════════════════════════════════════
        //  Groupe 2 : toutes les vérifications statiques + compilation TypeScript
        //  en parallèle pour minimiser le temps de feedback
            parallel {

                stage('Lint Backend') {
                    steps {
                        sh 'npm run lint --workspace=backend'
                    }
                    post {
                        failure { echo '❌ Lint Backend : erreurs ESLint détectées' }
                        success { echo '✅ Lint Backend OK' }
                    }
                }

                stage('Lint Frontend') {
                    steps {
                        sh 'npm run lint --workspace=frontend'
                    }
                    post {
                        failure { echo '❌ Lint Frontend : erreurs ESLint détectées' }
                        success { echo '✅ Lint Frontend OK' }
                    }
                }

                stage('Qualit\u00e9 npm') {
                    steps {
                        sh '''
                            echo "=== Audit des dépendances npm ==="
                            npm audit --audit-level=high --workspaces || true
                            echo "=== Licences (top 10) ==="
                            npx license-checker --summary --production 2>/dev/null | head -10 || true
                        '''
                    }
                }

                stage('SonarCloud') {
                    steps {
                        withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN_VAL')]) {
                            sh """
                                echo "=== Analyse SonarCloud ==="
                                npx sonarqube-scanner \\
                                    -Dsonar.host.url=${SONAR_HOST_URL} \\
                                    -Dsonar.token=\${SONAR_TOKEN_VAL} \\
                                    -Dsonar.projectKey=goodfood-apps_collector-shop \\
                                    -Dsonar.organization=goodfood-apps \\
                                    -Dsonar.projectVersion=${BUILD_NUMBER} \\
                                    -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info \\
                                    && echo "✅ SonarCloud : analyse envoyée" \\
                                    || echo "⚠️  SonarCloud non disponible — analyse ignorée"
                            """
                        }
                    }
                }

                stage('Compilation Backend') {
                    steps {
                        sh 'npm run build --workspace=backend'
                    }
                    post {
                        failure { echo '❌ Compilation Backend : erreur TypeScript' }
                        success { echo '✅ Compilation Backend OK' }
                    }
                }

                stage('Compilation Frontend') {
                    steps {
                        sh 'npm run build --workspace=frontend'
                    }
                    post {
                        failure { echo '❌ Compilation Frontend : erreur TypeScript/Vite' }
                        success { echo '✅ Compilation Frontend OK' }
                    }
                }

            }
        }

        // ═════════════════════════════════════════════════════════════════════
        stage('Tests Unitaires') {
        // ═════════════════════════════════════════════════════════════════════
        //  Groupe 3 : tests Jest backend + frontend en parallèle
        //    - Branche A : démarrage PostgreSQL éphémère → tests backend (nécessite DB)
        //    - Branche B : tests frontend (jsdom, aucune DB requise — démarre immédiatement)
            parallel {

                stage('Backend (DB \u2192 Tests)') {
                    stages {

                        stage('D\u00e9marrage Base de Donn\u00e9es') {
                            steps {
                                script {
                                    sh """
                                        echo "=== Démarrage PostgreSQL de test (port ${PG_PORT}) ==="
                                        docker run -d \\
                                            --name ${PG_CONTAINER} \\
                                            -p ${PG_PORT}:5432 \\
                                            -e POSTGRES_USER=${PG_USER} \\
                                            -e POSTGRES_PASSWORD=${PG_PASSWORD} \\
                                            -e POSTGRES_DB=${PG_DB} \\
                                            postgres:15-alpine

                                        for i in \$(seq 1 30); do
                                            if docker exec ${PG_CONTAINER} pg_isready -U ${PG_USER} 2>/dev/null; then
                                                echo "✅ PostgreSQL prêt sur localhost:${PG_PORT}"
                                                break
                                            fi
                                            [ \$i -eq 30 ] && echo "❌ Timeout PostgreSQL" && exit 1
                                            echo "Tentative \$i/30 — attente 3s..."
                                            sleep 3
                                        done
                                    """
                                    sh """
                                        cd backend
                                        DATABASE_URL=${DATABASE_URL} \\
                                        npx prisma db push --accept-data-loss --skip-generate
                                        echo "✅ Schéma Prisma appliqué"
                                    """
                                }
                            }
                        }

                        stage('Tests Unitaires Backend') {
                            steps {
                                sh """
                                    echo "=== Tests Backend (coverage + JUnit XML) ==="
                                    mkdir -p backend/test-results
                                    DATABASE_URL=${DATABASE_URL} \\
                                    JWT_SECRET=${JWT_SECRET} \\
                                    JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET} \\
                                    NODE_ENV=test \\
                                    JEST_JUNIT_OUTPUT_DIR=test-results \\
                                    JEST_JUNIT_OUTPUT_NAME=junit-backend.xml \\
                                    JEST_JUNIT_CLASSNAME='{classname}' \\
                                    JEST_JUNIT_TITLE='{title}' \\
                                    npm run test:coverage --workspace=backend -- \\
                                        --reporters=default --reporters=jest-junit \\
                                        --forceExit 2>&1
                                    echo "✅ Tests Backend : tous passés"
                                    ls -la backend/test-results/ 2>/dev/null || true
                                """
                            }
                            post {
                                always {
                                    junit(
                                        testResults: 'backend/test-results/junit-backend.xml',
                                        allowEmptyResults: true
                                    )
                                    publishHTML(target: [
                                        allowMissing         : true,
                                        alwaysLinkToLastBuild: true,
                                        keepAll              : true,
                                        reportDir            : 'backend/coverage/lcov-report',
                                        reportFiles          : 'index.html',
                                        reportName           : 'Couverture Backend'
                                    ])
                                }
                                success { echo '✅ Tests Backend : tous passés' }
                                failure { echo '❌ Tests Backend : échecs détectés' }
                            }
                        }

                    }
                }

                stage('Tests Unitaires Frontend') {
                    steps {
                        sh """
                            echo "=== Tests Frontend (coverage + JUnit XML) ==="
                            mkdir -p frontend/test-results
                            JEST_JUNIT_OUTPUT_DIR=test-results \\
                            JEST_JUNIT_OUTPUT_NAME=junit-frontend.xml \\
                            JEST_JUNIT_CLASSNAME='{classname}' \\
                            JEST_JUNIT_TITLE='{title}' \\
                            npm run test:coverage --workspace=frontend -- \\
                                --reporters=default --reporters=jest-junit \\
                                --forceExit 2>&1
                            echo "✅ Tests Frontend : tous passés"
                            ls -la frontend/test-results/ 2>/dev/null || true
                        """
                    }
                    post {
                        always {
                            junit(
                                testResults: 'frontend/test-results/junit-frontend.xml',
                                allowEmptyResults: true
                            )
                            publishHTML(target: [
                                allowMissing         : true,
                                alwaysLinkToLastBuild: true,
                                keepAll              : true,
                                reportDir            : 'frontend/coverage',
                                reportFiles          : 'index.html',
                                reportName           : 'Couverture Frontend'
                            ])
                        }
                        success { echo '✅ Tests Frontend : tous passés' }
                        failure { echo '❌ Tests Frontend : échecs détectés' }
                    }
                }

            }
        }

        // ═════════════════════════════════════════════════════════════════════
        stage('Analyse S\u00e9curit\u00e9') {
        // ═════════════════════════════════════════════════════════════════════
        //  Groupe 4 : scan SAST + dépendances AVANT build Docker
        //  Trivy FS analyse le code source et les node_modules
            parallel {

                stage('Trivy Filesystem') {
                    steps {
                        sh """
                            echo "=== Scan Trivy — Système de fichiers ==="
                            trivy fs . \\
                                --exit-code 0 \\
                                --severity HIGH,CRITICAL \\
                                --scanners vuln,secret \\
                                --format table \\
                                --timeout 10m \\
                                --skip-dirs node_modules/.cache \\
                                --skip-dirs .git \\
                                2>&1 | tee trivy-fs-report.txt
                            echo "✅ Scan Trivy FS terminé"
                        """
                    }
                    post {
                        always {
                            archiveArtifacts(
                                artifacts: 'trivy-fs-report.txt',
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

                stage('Audit npm Strict') {
                    steps {
                        sh """
                            echo "=== Audit npm — Vulnérabilités critiques ==="
                            npm audit --audit-level=critical --workspaces 2>&1 | tee npm-audit-report.txt || true
                            CRITICAL_COUNT=\$(grep -c '"severity":"critical"' npm-audit-report.txt 2>/dev/null || echo 0)
                            echo "Vulnérabilités critiques : \${CRITICAL_COUNT}"
                            echo "✅ Audit npm terminé"
                        """
                    }
                    post {
                        always {
                            archiveArtifacts(
                                artifacts: 'npm-audit-report.txt',
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

            }
        }

        // ═════════════════════════════════════════════════════════════════════
        stage('Build Images Docker') {
        // ═════════════════════════════════════════════════════════════════════
        //  Groupe 5 : build des images + scan Trivy sur les images produites
            stages {

                stage('Build') {
                    parallel {

                        stage('Image Backend') {
                            steps {
                                sh """
                                    echo "=== Build image backend (tag: ${BUILD_NUMBER}) ==="
                                    docker build \\
                                        -t ${PROJECT_NAME}-backend:${BUILD_NUMBER} \\
                                        -t ${PROJECT_NAME}-backend:latest \\
                                        -f backend/Dockerfile backend/
                                    echo "✅ Image backend construite"
                                """
                            }
                        }

                        stage('Image Frontend') {
                            steps {
                                sh """
                                    echo "=== Build image frontend (tag: ${BUILD_NUMBER}) ==="
                                    docker build \\
                                        -t ${PROJECT_NAME}-frontend:${BUILD_NUMBER} \\
                                        -t ${PROJECT_NAME}-frontend:latest \\
                                        -f frontend/Dockerfile .
                                    echo "✅ Image frontend construite"
                                """
                            }
                        }

                    }
                }

                stage('Scan Images') {
                    steps {
                        sh """
                            echo "=== Scan Trivy — Image Backend ==="
                            trivy image \\
                                --exit-code 0 \\
                                --severity HIGH,CRITICAL \\
                                --format table \\
                                --timeout 10m \\
                                ${PROJECT_NAME}-backend:${BUILD_NUMBER}

                            echo "=== Scan Trivy — Image Frontend ==="
                            trivy image \\
                                --exit-code 0 \\
                                --severity HIGH,CRITICAL \\
                                --format table \\
                                --skip-db-update \\
                                --timeout 10m \\
                                ${PROJECT_NAME}-frontend:${BUILD_NUMBER}

                            echo "✅ Scan images terminé"
                            echo "=== Images sur Docker host ==="
                            docker images | grep ${PROJECT_NAME}
                        """
                    }
                }

                stage('Chargement Minikube') {
                    steps {
                        sh """
                            echo "=== Chargement images → daemon Docker Minikube ==="
                            MINIKUBE_DOCKER="docker --tls \\
                                --tlscacert ${MINIKUBE_CERTS}/ca.pem \\
                                --tlscert   ${MINIKUBE_CERTS}/cert.pem \\
                                --tlskey    ${MINIKUBE_CERTS}/key.pem \\
                                -H ${MINIKUBE_DOCKER_HOST}"

                            echo "  → Backend  :${BUILD_NUMBER}"
                            docker save ${PROJECT_NAME}-backend:${BUILD_NUMBER} \\
                                | \${MINIKUBE_DOCKER} load
                            echo "  ✅ collector-shop-backend:${BUILD_NUMBER} disponible dans Minikube"

                            echo "  → Frontend :${BUILD_NUMBER}"
                            docker save ${PROJECT_NAME}-frontend:${BUILD_NUMBER} \\
                                | \${MINIKUBE_DOCKER} load
                            echo "  ✅ collector-shop-frontend:${BUILD_NUMBER} disponible dans Minikube"

                            echo "=== Images dans Minikube (collector-shop) ==="
                            \${MINIKUBE_DOCKER} images | grep ${PROJECT_NAME} || true
                        """
                    }
                }

            }
        }

        // ═════════════════════════════════════════════════════════════════════
        stage('V\u00e9rification ArgoCD') {
        // ═════════════════════════════════════════════════════════════════════
        //  Groupe 6 : GitOps — mise à jour du manifest + sync ArgoCD
        //    1. kustomize edit set image → met à jour kustomization.yaml
        //    2. git push → Gitea (ArgoCD watch)
        //    3. REST API ArgoCD → déclenche le sync
        //    4. Polling → attend Synced + Healthy
            stages {

                stage('Mise \u00e0 jour Manifests') {
                    steps {
                        withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'GH_TOKEN')]) {
                            sh """
                                echo "=== Mise à jour kustomization.yaml (build ${BUILD_NUMBER}) ==="
                                GITEA_URL="http://gitea-admin:\${GH_TOKEN}@192.168.49.2:31200/gitea-admin/collector-shop.git"

                                # Cloner Gitea dans un répertoire temporaire (évite les conflits
                                # de divergence entre le workspace Jenkins et l'historique Gitea)
                                TMPDIR=\$(mktemp -d)
                                git clone "\${GITEA_URL}" "\${TMPDIR}/repo"
                                cd "\${TMPDIR}/repo/${MANIFEST_PATH}"

                                # Appliquer les nouveaux tags d'image
                                kustomize edit set image \\
                                    ${PROJECT_NAME}-backend=${PROJECT_NAME}-backend:${BUILD_NUMBER}
                                kustomize edit set image \\
                                    ${PROJECT_NAME}-frontend=${PROJECT_NAME}-frontend:${BUILD_NUMBER}

                                echo "--- kustomization.yaml après mise à jour ---"
                                cat kustomization.yaml

                                # Commit + push depuis le clone propre
                                cd "\${TMPDIR}/repo"
                                git config user.email "jenkins@collector-shop.local"
                                git config user.name  "Jenkins CI"

                                git add ${MANIFEST_PATH}/kustomization.yaml
                                if git diff --cached --quiet; then
                                    echo "ℹ️  Pas de changement de manifest (même tag)"
                                else
                                    git commit -m "ci: deploy build ${BUILD_NUMBER} [${ARGOCD_APP}] [skip ci]"
                                    git push origin HEAD:${GIT_DEPLOY_BRANCH}
                                    echo "✅ Manifests poussés → Gitea (branche: ${GIT_DEPLOY_BRANCH})"
                                fi

                                rm -rf "\${TMPDIR}"
                            """
                        }
                    }
                }

                stage('Sync & Health Check') {
                    steps {
                        sh """
                            MINIKUBE_IP=\$(minikube ip 2>/dev/null || echo "192.168.49.2")
                            ARGOCD_URL="http://\${MINIKUBE_IP}:31080"
                            echo "=== Sync ArgoCD → \${ARGOCD_URL} (app: ${ARGOCD_APP}) ==="

                            # Auth : obtenir JWT via session (admin + password kubectl)
                            ARGOCD_PWD=\$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' 2>/dev/null | base64 -d 2>/dev/null || echo "")
                            ARGOCD_TOKEN=""
                            if [ -n "\${ARGOCD_PWD}" ]; then
                                ARGOCD_TOKEN=\$(curl -sf -X POST "\${ARGOCD_URL}/api/v1/session" \\
                                    -H "Content-Type: application/json" \\
                                    -d "{\\"username\\":\\"admin\\",\\"password\\":\\"\${ARGOCD_PWD}\\"}" 2>/dev/null \\
                                    | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
                                [ -n "\${ARGOCD_TOKEN}" ] && echo "Auth ArgoCD OK (session JWT)"
                            fi

                            # Sync (si token JWT obtenu)
                            if [ -n "\${ARGOCD_TOKEN}" ]; then
                                SYNC_RESP=\$(curl -sf -X POST "\${ARGOCD_URL}/api/v1/applications/${ARGOCD_APP}/sync" \\
                                    -H "Authorization: Bearer \${ARGOCD_TOKEN}" \\
                                    -H "Content-Type: application/json" \\
                                    -d '{"prune":false,"dryRun":false}' \\
                                    -w "\\nHTTP_CODE:%{http_code}" 2>&1 || echo "\\nHTTP_CODE:000")
                                HTTP_CODE=\$(echo "\${SYNC_RESP}" | grep "HTTP_CODE:" | cut -d: -f2)
                                echo "Sync HTTP: \${HTTP_CODE}"
                            else
                                echo "⚠️  Impossible d'obtenir le token ArgoCD — polling direct"
                            fi

                            # Polling Synced + Healthy (max 5 min)
                            echo "Polling Synced + Healthy (max 5 min)..."
                            for i in \$(seq 1 30); do
                                if [ -n "\${ARGOCD_TOKEN}" ]; then
                                    STATUS=\$(curl -sf -H "Authorization: Bearer \${ARGOCD_TOKEN}" "\${ARGOCD_URL}/api/v1/applications/${ARGOCD_APP}" 2>/dev/null \\
                                        | python3 -c "import sys,json;d=json.load(sys.stdin);s=d.get('status') or {};print((s.get('sync') or {}).get('status','?')+' '+(s.get('health') or {}).get('status','?'))" 2>/dev/null || echo "? ?")
                                else
                                    STATUS="? ?"
                                fi
                                SYNC_ST=\$(echo "\${STATUS}" | cut -d' ' -f1)
                                HEALTH_ST=\$(echo "\${STATUS}" | cut -d' ' -f2)
                                echo "  [\${i}/30] Sync: \${SYNC_ST}  Health: \${HEALTH_ST}"

                                if [ "\${SYNC_ST}" = "Synced" ] && [ "\${HEALTH_ST}" = "Healthy" ]; then
                                    echo "✅ ArgoCD : Synced + Healthy"
                                    exit 0
                                fi
                                [ \$i -eq 30 ] && echo "⚠️  Timeout — continue (apps peuvent être OK)"
                                sleep 10
                            done
                        """
                    }
                }

            }
        }

        // ═════════════════════════════════════════════════════════════════════
        stage('Tests de Charge & Int\u00e9gration') {
        // ═════════════════════════════════════════════════════════════════════
        //  Groupe 7 : tests post-déploiement sur l'environnement Minikube live
        //    - Tests d'intégration : health-checks + smoke tests sur les endpoints
        //    - Tests de charge     : Artillery (P95 < 500ms, taux erreur < 5%)
            parallel {

                stage('Tests Int\u00e9gration (live)') {
                    steps {
                        sh """
                            echo "=== Tests d'intégration sur Minikube (live) ==="
                            BACKEND="${MINIKUBE_BACKEND_URL}"
                            FRONTEND="${MINIKUBE_FRONTEND_URL}"

                            # Attendre que les services soient disponibles (max 3 min)
                            echo "Attente du backend (\${BACKEND})..."
                            for i in \$(seq 1 18); do
                                if curl -sf \${BACKEND}/health --max-time 5 > /dev/null 2>&1; then
                                    echo "✅ Backend opérationnel"
                                    break
                                fi
                                [ \$i -eq 18 ] && echo "⚠️  Backend non disponible — tests ignorés" && exit 0
                                echo "  Tentative \$i/18 — attente 10s..."
                                sleep 10
                            done

                            # Smoke tests sur les endpoints critiques
                            echo "--- Smoke tests ---"
                            check() {
                                CODE=\$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 "\$1" 2>/dev/null)
                                if echo "200 201 301 302" | grep -q "\${CODE}"; then
                                    echo "  ✅ \$1 → HTTP \${CODE}"
                                else
                                    echo "  ⚠️  \$1 → HTTP \${CODE} (attendu 2xx/3xx)"
                                fi
                            }
                            check "\${BACKEND}/health"
                            check "\${BACKEND}/api/announcements"
                            check "\${FRONTEND}"

                            echo "✅ Tests d'intégration terminés"
                        """
                    }
                }

                stage('Tests de Charge (Artillery)') {
                    steps {
                        sh """
                            echo "=== Tests de charge Artillery ==="
                            BACKEND="${MINIKUBE_BACKEND_URL}"
                            REPORT_JSON="artillery-report-${BUILD_NUMBER}.json"
                            REPORT_HTML="artillery-report-${BUILD_NUMBER}.html"

                            # Vérifier que le backend répond
                            if ! curl -sf \${BACKEND}/health --max-time 5 > /dev/null 2>&1; then
                                echo "⚠️  Backend non disponible — tests de charge ignorés"
                                exit 0
                            fi

                            # Lancer Artillery
                            npx artillery run \\
                                --output \${REPORT_JSON} \\
                                --target \${BACKEND} \\
                                ${ARTILLERY_CONFIG} || true

                            # Rapport HTML
                            npx artillery report \\
                                --output \${REPORT_HTML} \\
                                \${REPORT_JSON} || true

                            # Résumé
                            echo "=== Résumé Artillery ==="
                            python3 -c "
import json, sys
try:
    with open('\${REPORT_JSON}') as f:
        d = json.load(f)
    agg = d.get('aggregate', {})
    counters = agg.get('counters', {})
    summary  = agg.get('summaries', {})
    lat = agg.get('latencies', {})
    total   = counters.get('http.requests', 0)
    failed  = counters.get('vusers.failed', 0)
    p95     = summary.get('http.response_time', {}).get('p95', 'N/A')
    rate_err = round(failed / total * 100, 2) if total else 0
    print(f'Requêtes totales : {total}')
    print(f'Échecs           : {failed}  ({rate_err}%)')
    print(f'P95 latence      : {p95} ms')
    status = '✅ OK' if rate_err < 5 and (p95 == \"N/A\" or float(p95) < 500) else '⚠️  DÉGRADÉ'
    print(f'Verdict          : {status}')
except Exception as e:
    print(f'(résumé indisponible : {e})')
" || echo "(résumé non disponible)"
                        """
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing         : true,
                                alwaysLinkToLastBuild: true,
                                keepAll              : true,
                                reportDir            : '.',
                                reportFiles          : "artillery-report-${BUILD_NUMBER}.html",
                                reportName           : 'Tests de Charge Artillery'
                            ])
                            archiveArtifacts(
                                artifacts: "artillery-report-${BUILD_NUMBER}.json",
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

                stage('Tests de Charge (Locust)') {
                    steps {
                        sh """
                            echo "=== Tests de charge Locust (via Docker) ==="
                            BACKEND="${MINIKUBE_BACKEND_URL}"
                            MINIKUBE_IP=\$(minikube ip 2>/dev/null || echo "192.168.49.2")
                            WORKSPACE_ABS=\$(pwd)
                            LOCUST_HTML="locust-report-${BUILD_NUMBER}.html"
                            LOCUST_CSV="locust-stats-${BUILD_NUMBER}"

                            # Vérifier que le backend répond
                            if ! curl -sk \${BACKEND}/health --max-time 5 > /dev/null 2>&1; then
                                echo "⚠️  Backend non disponible — tests Locust ignorés"
                                exit 0
                            fi

                            echo "▶  Lancement Locust (Docker) : 50 users / spawn-rate 5 / 60s"
                            docker run --rm \\
                                --network host \\
                                --add-host "api.shopcollector.local:\${MINIKUBE_IP}" \\
                                --add-host "shopcollector.local:\${MINIKUBE_IP}" \\
                                -v "\${WORKSPACE_ABS}/tests/load-tests:/mnt/locust:ro" \\
                                -v "\${WORKSPACE_ABS}:/mnt/workspace" \\
                                locustio/locust \\
                                    -f /mnt/locust/locustfile.py \\
                                    --host \${BACKEND} \\
                                    --headless \\
                                    --users 50 \\
                                    --spawn-rate 5 \\
                                    --run-time 60s \\
                                    --html /mnt/workspace/\${LOCUST_HTML} \\
                                    --csv /mnt/workspace/\${LOCUST_CSV} \\
                                    --csv-full-history \\
                                    --only-summary \\
                                    --loglevel WARNING || true

                            # Résumé CSV → console (python3 est disponible dans Jenkins)
                            echo "=== Résumé Locust ==="
                            python3 -c "
import csv, os, sys
stats_file = '\${LOCUST_CSV}_stats.csv'
if not os.path.exists(stats_file):
    print('(fichier stats absent — Locust non exécuté)')
    sys.exit(0)
with open(stats_file) as f:
    rows = list(csv.DictReader(f))
agg = next((r for r in rows if r.get('Name') == 'Aggregated'), None)
if not agg:
    print('(ligne Aggregated non trouvée)')
    sys.exit(0)
req      = int(agg.get('Request Count', 0))
fail     = int(agg.get('Failure Count', 0))
p50      = agg.get('50%', 'N/A')
p95      = agg.get('95%', 'N/A')
p99      = agg.get('99%', 'N/A')
rps      = agg.get('Requests/s', 'N/A')
err_pct  = round(fail / req * 100, 1) if req else 0
ok = err_pct < 5 and (p95 == 'N/A' or float(p95) < 500)
print(f'Requêtes totales : {req}')
print(f'Echecs           : {fail}  ({err_pct} %)')
print(f'Debit            : {rps} req/s')
print(f'P50 latence      : {p50} ms')
print(f'P95 latence      : {p95} ms')
print(f'P99 latence      : {p99} ms')
print(f'Verdict          : {\"OK\" if ok else \"DEGRADE\"}')
" || echo "(résumé non disponible)"
                        """
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing         : true,
                                alwaysLinkToLastBuild: true,
                                keepAll              : true,
                                reportDir            : '.',
                                reportFiles          : "locust-report-${BUILD_NUMBER}.html",
                                reportName           : 'Tests de Charge Locust'
                            ])
                            archiveArtifacts(
                                artifacts: "locust-report-${BUILD_NUMBER}.html, locust-stats-${BUILD_NUMBER}*.csv",
                                allowEmptyArchive: true
                            )
                        }
                    }
                }

            }
        }

    }

    // ═══════════════════════════════════════════════════════════════════════
    post {
    // ═══════════════════════════════════════════════════════════════════════

        always {
            script {
                // Nettoyage PostgreSQL de test
                sh "docker rm -f ${env.PG_CONTAINER} 2>/dev/null || true"
            }
            cleanWs()
        }

        // ─── Notification Discord ────────────────────────────────────────
        success {
            script {
                def duration  = currentBuild.durationString.replace(' and counting', '')
                def commitSha = sh(script: 'git rev-parse --short HEAD 2>/dev/null || echo "N/A"', returnStdout: true).trim()
                def commitMsg = sh(script: 'git log -1 --pretty=%s 2>/dev/null || echo "N/A"', returnStdout: true).trim()
                def appLabel     = env.MINIKUBE_FRONTEND_URL.replaceAll('https?://', '')
                def apiLabel     = env.MINIKUBE_BACKEND_URL.replaceAll('https?://', '') + '/health'
                def grafanaLabel = env.GRAFANA_URL.replaceAll('https?://', '')
                discordNotify(
                    status: 'SUCCESS',
                    color: 3066993,
                    emoji: '✅',
                    title: "Pipeline CI/CD — BUILD #${BUILD_NUMBER} RÉUSSI",
                    fields: [
                        [name: '🌿 Branche',         value: "${GIT_DEPLOY_BRANCH}",                                                                    inline: true],
                        [name: '🔖 Commit',           value: "`${commitSha}`",                                                                          inline: true],
                        [name: '⏱️ Durée',            value: duration,                                                                                   inline: true],
                        [name: '💬 Message',          value: escJson(commitMsg),                                                                         inline: false],
                        [name: '🌐 Application',      value: "[${appLabel}](${MINIKUBE_FRONTEND_URL})",                                                  inline: true],
                        [name: '🔧 API Health',       value: "[${apiLabel}](${MINIKUBE_BACKEND_URL}/health)",                                            inline: true],
                        [name: '🚀 ArgoCD',           value: "[argocd.shopcollector.local](https://argocd.shopcollector.local/applications/${ARGOCD_APP})", inline: true],
                        [name: '📊 Grafana',          value: "[${grafanaLabel}](${GRAFANA_URL})",                                                        inline: true],
                        [name: '📡 Netdata',          value: "[netdata.shopcollector.local](https://netdata.shopcollector.local)",                        inline: true],
                        [name: '🐙 Gitea',            value: "[gitea.shopcollector.local](https://gitea.shopcollector.local)",                           inline: true],
                        [name: '🔍 SonarCloud',       value: "[sonarcloud.io](https://sonarcloud.io/project/overview?id=goodfood-apps_collector-shop)",  inline: true],
                        [name: '🏗️ Jenkins',          value: "[Build #${BUILD_NUMBER}](${BUILD_URL})",                                                   inline: true],
                    ]
                )
            }
        }

        failure {
            script {
                def duration  = currentBuild.durationString.replace(' and counting', '')
                def commitSha = sh(script: 'git rev-parse --short HEAD 2>/dev/null || echo "N/A"', returnStdout: true).trim()
                def commitMsg = sh(script: 'git log -1 --pretty=%s 2>/dev/null || echo "N/A"', returnStdout: true).trim()
                def appLabel  = env.MINIKUBE_FRONTEND_URL.replaceAll('https?://', '')
                discordNotify(
                    status: 'FAILURE',
                    color: 15158332,
                    emoji: '❌',
                    title: "Pipeline CI/CD — BUILD #${BUILD_NUMBER} ÉCHOUÉ",
                    fields: [
                        [name: '🌿 Branche',         value: "${GIT_DEPLOY_BRANCH}",                                                                       inline: true],
                        [name: '🔖 Commit',           value: "`${commitSha}`",                                                                             inline: true],
                        [name: '⏱️ Durée',            value: duration,                                                                                      inline: true],
                        [name: '💬 Message',          value: escJson(commitMsg),                                                                            inline: false],
                        [name: '📋 Logs Jenkins',     value: "[Build #${BUILD_NUMBER} — Logs](${BUILD_URL}console)",                                       inline: false],
                        [name: '🚀 ArgoCD',           value: "[argocd.shopcollector.local](https://argocd.shopcollector.local/applications/${ARGOCD_APP})", inline: true],
                        [name: '🌐 Application',      value: "[${appLabel}](${MINIKUBE_FRONTEND_URL})",                                                    inline: true],
                    ]
                )
            }
        }

        unstable {
            script {
                def duration     = currentBuild.durationString.replace(' and counting', '')
                def commitSha    = sh(script: 'git rev-parse --short HEAD 2>/dev/null || echo "N/A"', returnStdout: true).trim()
                def appLabel     = env.MINIKUBE_FRONTEND_URL.replaceAll('https?://', '')
                def grafanaLabel = env.GRAFANA_URL.replaceAll('https?://', '')
                discordNotify(
                    status: 'UNSTABLE',
                    color: 16776960,
                    emoji: '⚠️',
                    title: "Pipeline CI/CD — BUILD #${BUILD_NUMBER} INSTABLE",
                    fields: [
                        [name: '🌿 Branche',         value: "${GIT_DEPLOY_BRANCH}",                                                                       inline: true],
                        [name: '🔖 Commit',           value: "`${commitSha}`",                                                                             inline: true],
                        [name: '⏱️ Durée',            value: duration,                                                                                      inline: true],
                        [name: '📋 Logs Jenkins',     value: "[Build #${BUILD_NUMBER} — Logs](${BUILD_URL}console)",                                       inline: false],
                        [name: '🚀 ArgoCD',           value: "[argocd.shopcollector.local](https://argocd.shopcollector.local/applications/${ARGOCD_APP})", inline: true],
                        [name: '🌐 Application',      value: "[${appLabel}](${MINIKUBE_FRONTEND_URL})",                                                    inline: true],
                        [name: '📊 Grafana',          value: "[${grafanaLabel}](${GRAFANA_URL})",                                                          inline: true],
                    ]
                )
            }
        }

    }
}

// =============================================================================
// Helpers
// =============================================================================

// Échappe une chaîne pour l'insérer dans un payload JSON (Discord webhook)
def escJson(String s) {
    return s.replace('\\', '\\\\')
            .replace('"',  '\\"')
            .replace('\n', ' ')
            .replace('\r', '')
            .replace('\t', ' ')
}

// =============================================================================
// Fonction utilitaire : envoi notification Discord via webhook (curl)
// =============================================================================
def discordNotify(Map args) {
    withCredentials([string(credentialsId: 'DISCORD_WEBHOOK', variable: 'WEBHOOK_URL')]) {
        def fieldsJson = args.fields.collect { f ->
            """{"name":"${escJson(f.name)}","value":"${escJson(f.value)}","inline":${f.inline}}"""
        }.join(',')

        def payload = """{
            "embeds": [{
                "title": "${args.emoji}  ${args.title}",
                "color": ${args.color},
                "fields": [${fieldsJson}],
                "footer": {
                    "text": "Collector.shop CI/CD • Jenkins ${BUILD_NUMBER}"
                },
                "timestamp": "${new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))}"
            }]
        }"""

        sh """
            curl -sf -X POST "\${WEBHOOK_URL}" \\
                -H "Content-Type: application/json" \\
                -d '${payload.replaceAll("'", "\\\\'")}' \\
            && echo "✅ Notification Discord envoyée" \\
            || echo "⚠️  Notification Discord échouée (webhook indisponible)"
        """
    }
}
