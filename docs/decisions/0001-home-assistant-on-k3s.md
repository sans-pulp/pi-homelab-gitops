# 0001 · Home Assistant on K3s, config in Git, no secrets

Status: Accepted, 11 Nov 2026 · Deciders: Glo, Joy (review)

## Context
Roadmap Stage 1 started early, in a lean form, to feed the Bravia's home screen with live data. Vault and ESO arrive in Lab 05. This repo is public.

## Decision
- Home Assistant runs on `pi-node-1` as an Argo CD app (`apps/home-assistant.yaml`, `manifests/home-assistant/`). The image is pinned (2026.11.1), there's one replica, the strategy is `Recreate`, and it has a 10 Gi `local-path` volume at `/config`.
- `hostNetwork: true`, so mDNS, Google Cast and the Roborock's local port work.
- Git holds only what's safe to publish: `configuration.yaml`, packages, the dashboard, the Graphite theme. Kustomize turns them into ConfigMaps, so a change to any of them restarts the pod with the new config.
- Logins (the Bravia pre-shared key, the Roborock account, user tokens), the home location and people live in `/config/.storage` on the volume. They are typed into the UI and never committed.
- The robot keeps the name it has in the Roborock app, **Patricia**, so the config uses `vacuum.patricia` / `sensor.patricia_*`. The config follows the device name; the device isn't renamed to suit the config.

## Consequences
- A config change is a reviewed PR. Logins don't go through PRs at all.
- Until Lab 05 there's no backup of `/config/.storage` beyond the volume itself. Lab 06 adds GCS backups.
- Before any presence work (home location, people), the config moves to the private `la-pulp/home-assistant-config`.
- Bluetooth warnings in the log are expected. The container doesn't get `NET_ADMIN`/`NET_RAW` or the host's D-Bus, and nothing here uses Bluetooth.

## Rejected
- A separate box for Home Assistant: the Pi is enough, and when it's down the lamp switches and the Roborock app still work.
- Secrets in Git, even encrypted: they wait for Vault + ESO.
- Renaming the robot to "Roborock" to match the config.
