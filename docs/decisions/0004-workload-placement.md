# 0004 · What runs on which Pi, and the RAM budget

Status: Accepted, 11 Nov 2026

## Context
Both Pis are 8 GB Raspberry Pi 5s. Each Pi's GitOps repo deploys only what runs on that Pi (11 Nov). Moving the media stack to `joy-pi` was considered, and so was where metrics should live.

## Decision
### pi-node-1 (deployed from this repo)
| Workload | RAM | When |
|---|---|---|
| OS, K3s, Argo CD, Traefik, cert-manager, pill reminder | **2.5 GB measured** (11 Nov) | now |
| Home Assistant, Mosquitto, Zigbee2MQTT | 0.5–0.75 GB | Stage 1–2 |
| Vault + ESO | ~0.3 GB | Lab 05 |
| Tailscale operator + proxies | 0.3–0.5 GB | Lab 07 |
| Media stack (Jellyfin, *arrs, Seerr, Bazarr, Decypharr, books, music) | 2.5–3.5 GB | Labs 08–09 |
| Metrics and log collectors only (node-exporter, kube-state-metrics, an agent) | 0.1–0.2 GB | Lab 10 |
| **Total** | **~6.5–7.5 GB of 8** | |

### joy-pi (deployed from Joy's `platform-components`)
| Workload | RAM | When |
|---|---|---|
| OS, K3s, Argo CD, Envoy Gateway, MetalLB, Vault | ~2.5–3 GB (estimate) | now |
| Actual Budget + Pocket ID | ~0.2 GB | now |
| Household app + Postgres | 0.2–0.3 GB | Stage 4 |
| Pill reminder and self-hosted ntfy (moved from `pi-node-1`) | ~0.05 GB | with the household app's Health screen |
| Bible app (own database on the same Postgres) | 0.15–0.25 GB | after Lab 09, on hold |
| Metrics store, logs, Grafana, alert rules (for both Pis) | 0.5–1 GB | Lab 10 |
| Collectors for joy-pi itself | 0.1–0.2 GB | Lab 10 |
| **Total** | **~4–5 GB of 8** | |

Figures are typical, not measured, except the 2.5 GB row.

- **`joy-pi` owns metrics.** Each Pi runs only small collectors. The metrics store, log store, Grafana and alert rules run on `joy-pi` and watch both clusters. Home Assistant's long-term house history goes there too. No separate InfluxDB.
- **Lab 10 is done together on Joy's Pi.** Joy deploys the store and Grafana from her platform repos. Glo deploys the collectors on `pi-node-1` from this repo. Both build the dashboards and alerts.
- The collectors on `pi-node-1` send to `joy-pi` over the LAN (a MetalLB address in the homelab block, 0003) or over the tailnet. That's settled in Lab 10.
- The media stack stays on `pi-node-1`.
- Measure again after Lab 09. If `pi-node-1` is tight, move the optional Lab 09 apps first, then consider the media stack as the first tenant of a `pi-node-2`.

## Consequences
- Monitoring runs away from what it watches: if `pi-node-1` crashes or runs out of memory, the alert still fires from `joy-pi`. If `joy-pi` goes down, both lose monitoring until it's back, so its own health alert goes to ntfy.
- This is a deliberate exception to "one owner per cluster": Joy owns the metrics platform, and Glo owns what `pi-node-1` sends. Joy's `platform-docs` gets a matching record.
- **Joy's Vault leaves dev mode before Lab 10** (it holds Grafana's admin password and the alert keys), and before anything real (Actual data, the household app) relies on it.

## Rejected
- **The media stack on `joy-pi`:** it fits in RAM, but Labs 05–09 are Glo's platform track (her Vault with KMS unseal, the Tailscale operator, her Ansible `rclone_mount` role, the 1 TB NVMe). Joy's Vault is in dev mode, and the TV would point at a different Pi. Revisit only if Glo and Joy decide Joy should own media.
- **Metrics on each Pi separately:** monitoring would die with the Pi it watches, and `pi-node-1` would carry ~0.5–1 GB more.
- House services on `joy-pi`: Home Assistant needs host networking next to the TV and Zigbee, and rebuilding Joy's platform shouldn't turn the lights off.
- InfluxDB next to the metrics stack: two history stores for ~0.4 GB.
