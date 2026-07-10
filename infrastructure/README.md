# BrainBooster Infrastructure

| Artifact | Purpose |
|---|---|
| `docker-compose.full.yml` | Whole stack (db + api + web + admin + 5 services) in one command |
| `docker/service.Dockerfile` | Reusable image for any Node service/agent (`--build-arg SERVICE_DIR=…`) |
| `k8s/` | Kubernetes manifests: namespace, api, 5 services, ingress |
| `monitoring/prometheus.yml` | Scrape config (health/metrics endpoints) |

## Local full stack
```bash
docker compose -f infrastructure/docker-compose.full.yml up --build
# web   → :8080   admin → :8081   api → :4000
# services → :4101-4105  (each exposes GET /health)
```

## Kubernetes
```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl -n brainbooster create secret generic bb-secrets \
  --from-literal=database-url=postgres://... --from-literal=jwt-secret=...
kubectl apply -f infrastructure/k8s/
```

## Health & readiness
Every service exposes `GET /health` (used by k8s probes and Prometheus). The monolith API uses `GET /api/health`.

## Secrets
Never commit secrets. `k8s/` reads from the `bb-secrets` Secret; compose reads from env / `.env`. See each app's `.env.example`.
