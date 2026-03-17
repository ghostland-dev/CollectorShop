FROM jenkins/jenkins:lts-jdk21

USER root

# Install Node.js 20 (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && node --version && npm --version

# Install Docker CLI (pour builder les images et démarrer des conteneurs de test)
RUN apt-get update && apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
    && curl -fsSL https://download.docker.com/linux/debian/gpg \
        | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
        https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
        | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update && apt-get install -y docker-ce-cli

# Install Trivy (scanner de vulnérabilités pour les conteneurs)
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \
    | sh -s -- -b /usr/local/bin \
    && trivy --version

# Install kubectl (pour interagir avec Minikube depuis Jenkins)
RUN KUBECTL_VERSION=$(curl -sL https://dl.k8s.io/release/stable.txt) \
    && curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" \
        -o /usr/local/bin/kubectl \
    && chmod +x /usr/local/bin/kubectl \
    && kubectl version --client

# Install kustomize (pour mettre à jour les image tags dans les overlays)
RUN KUSTOMIZE_VERSION="5.3.0" \
    && curl -fsSL "https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${KUSTOMIZE_VERSION}/kustomize_v${KUSTOMIZE_VERSION}_linux_amd64.tar.gz" \
        -o /tmp/kustomize.tar.gz \
    && tar -xzf /tmp/kustomize.tar.gz -C /usr/local/bin \
    && rm /tmp/kustomize.tar.gz \
    && chmod +x /usr/local/bin/kustomize \
    && kustomize version

# Install ArgoCD CLI (pour déclencher les syncs depuis le pipeline)
RUN ARGOCD_VERSION=$(curl -sL https://api.github.com/repos/argoproj/argo-cd/releases/latest \
        | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/') \
    && curl -fsSL "https://github.com/argoproj/argo-cd/releases/download/${ARGOCD_VERSION}/argocd-linux-amd64" \
        -o /usr/local/bin/argocd \
    && chmod +x /usr/local/bin/argocd \
    && argocd version --client

# Install git (pour committer les mises à jour de manifests)
RUN apt-get update && apt-get install -y git

# Nettoyer les caches apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Créer .gitconfig directement dans l'image (évite les problèmes de bind-mount overlay2)
RUN printf '[safe]\n\tdirectory = /workspace/collector-shop\n\tdirectory = *\n' > /root/.gitconfig \
    && chmod 644 /root/.gitconfig

USER jenkins

# Désactiver le wizard de configuration initiale
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false -Xmx1g -Xms512m"
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc_configs

# Installer les plugins Jenkins
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/plugins.txt
