# Release Process

## Versioning
Semantic versioning per package. The game (`apps/web`) version drives store builds.

## Web / PWA
```bash
cd apps/web && npm run build        # dist/ — deploy behind nginx (see Dockerfile)
```

## Android (Capacitor)
```bash
cd apps/web
npm run android:sync                # build + cap sync
npm run android:apk                 # debug APK
npm run android:bundle              # release AAB for Play Store
```
Requires signing config and store credentials (see `docs/ANDROID.md`).

## Server & services (containers)
Images published to `ghcr.io/brainbooster/*`. Build with the shared Dockerfile:
```bash
docker build -f infrastructure/docker/service.Dockerfile \
  --build-arg SERVICE_DIR=services/leaderboard-service -t ghcr.io/brainbooster/leaderboard-service:$TAG .
```

## Checklist
1. `npm run test:all` green (agents + services + server).
2. `npm run build:web` and `npm run build:admin` green.
3. DB migrations applied (`database/migrations/`).
4. Bump versions + tag `vX.Y.Z`.
5. CI (`platform.yml`, `ci.yml`) green on the tag.
6. Deploy: `kubectl apply -f infrastructure/k8s/` (or compose for single-host).
7. Smoke test `/api/health` and each service `/health`.

## Rollback
Re-deploy the previous image tag; DB migrations are additive/idempotent, so no
down-migration is required for `0002_services`.
