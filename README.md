# pi-homelab-gitops

GitOps-managed Kubernetes manifests for a Raspberry Pi 5 k3s homelab.

Reconciled by ArgoCD using the app-of-apps pattern — a single root Application
discovers and manages all workloads declaratively from this repository.

## Infrastructure

- **Hardware:** Raspberry Pi 5 8GB, 1TB NVMe SSD
- **OS:** Ubuntu Server 24.04 LTS
- **Kubernetes:** k3s v1.35 (single-node)
- **Ingress:** Traefik (k3s default)
- **GitOps:** ArgoCD v3
- **Remote access:** Tailscale

## Repository Structure

```
pi-homelab-gitops/
├── bootstrap/          # One-time cluster bootstrap
│   └── root-app.yaml   # Apply once: kubectl apply -f bootstrap/root-app.yaml
├── apps/               # ArgoCD Application definitions (one per logical app)
│   ├── whoami.yaml
│   └── argocd.yaml
└── manifests/          # Actual Kubernetes resources
├── whoami/         # Deployment, Service, Ingress
└── argocd/         # ArgoCD supplementary config (ingress)
```

## How It Works

```
root Application (bootstrap/root-app.yaml)
↓ watches apps/
├── whoami → manifests/whoami/
└── argocd-config → manifests/argocd/
```

ArgoCD's app-of-apps pattern means:
- The root Application watches `apps/` for Application definitions
- Each Application in `apps/` points to its manifests in `manifests/`
- Adding a new app = one Application YAML in `apps/` + manifests in `manifests/<app>/`
- No manual kubectl steps beyond initial bootstrap

## Bootstrapping a Fresh Cluster

```bash
# 1. Install k3s (handled by Ansible in private homelab repo)
# 2. Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Apply root Application — ArgoCD reconciles everything else
kubectl apply -f bootstrap/root-app.yaml
```

## Adding a New App

```bash
# 1. Create manifests
mkdir manifests/<app>
# add Deployment, Service, Ingress etc.

# 2. Create ArgoCD Application definition
nano apps/<app>.yaml

# 3. Commit and push to main
git add .
git commit -m "add <app>"
git push
# ArgoCD picks it up automatically via root Application
```

## Current Workloads

| App | Namespace | Description |
|---|---|---|
| whoami | default | HTTP echo service, used for ingress/GitOps validation |
| argocd-config | argocd | ArgoCD ingress configuration |

## Related

- Host-level config (Ansible, k3s install, UFW, SSH hardening) lives in a
  separate private [homelab](https://github.com/sans-pulp/homelab) repo.
- This repo is intentionally public — it serves as both a functional GitOps
  repo and a portfolio reference.




