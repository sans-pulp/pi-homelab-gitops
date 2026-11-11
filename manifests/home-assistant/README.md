# Home Assistant (namespace `home`)

Roadmap Stage 1, lean version (started 11 Nov 2026). Runs on pi-node-1 with host networking on port 8123.
Addresses live in the private Pi 5 Homelab tracker, never in this public repo. The full setup guide is in the Pi 5 Homelab tracker → Guides → Home Assistant.

| What | Where |
|---|---|
| Argo CD app | `apps/home-assistant.yaml` |
| Core config, no secrets, no home location | `config/configuration.yaml` |
| Features | `packages/*.yaml`: `tv_home` (TV feed + pop-ups), `roborock`, `homelab_health` |
| Dashboard "Home" | `dashboards/home.yaml` (YAML mode) |
| Theme "Graphite" | `themes/graphite.yaml`, copied from the design system; Plex fonts via `www/homelab-fonts.js` |
| Logins, tokens, integrations, history | the `home-assistant-config` PVC (`/config/.storage`), never Git |

Changing a file here renames its ConfigMap (kustomize hash), so Argo CD restarts Home Assistant with it.

## Before the first sync

Anything private, including LAN addresses, goes in a Secret that is created by hand and never committed.
Home Assistant reads it as `/config/secrets.yaml` (`!secret` in the packages). Without it the pod stays in
`ContainerCreating`, so create it before merging. On the Pi:

```sh
umask 077
printf 'tv_pipup_url: http://%s:7979/notify\n' '<tv address>' > /tmp/ha-secrets.yaml
kubectl create namespace home --dry-run=client -o yaml | kubectl apply -f -
kubectl -n home create secret generic ha-secrets --from-file=secrets.yaml=/tmp/ha-secrets.yaml \
  --dry-run=client -o yaml | kubectl apply -f -
rm /tmp/ha-secrets.yaml
```

To change a value later, run the same lines again, then `kubectl -n home rollout restart deploy/home-assistant`.
In Lab 05 an ExternalSecret from Vault replaces this.

## Entity IDs the packages expect

| Entity | From |
|---|---|
| `weather.forecast_home` | Met.no, created at onboarding |
| `media_player.bravia` | Sony Bravia TV integration; rename the device to "Bravia" |
| `vacuum.patricia`, `sensor.patricia_*` | Roborock integration; the robot keeps its app name "Patricia". If IDs differ, check Developer tools → States |
| `sensor.system_monitor_processor_temperature`, `_memory_usage`, `_disk_usage` | System Monitor integration |

## TV feed contract (`sensor.tv_home_feed`, version 1)

The Bravia launcher (`la-pulp/homelab-tv`, `HaFeed.java`) reads
`GET /api/states/sensor.tv_home_feed` every 60 s with the `tv` user's token. State is the minute it was built.
Attributes:

```json
{
  "version": 1,
  "status": "good | warn | bad | unknown",
  "status_text": "Homelab · all normal",
  "weather": {"condition": "cloudy", "temp": -4.0, "feels": -10.0, "unit": "°C", "high": 2.0, "low": -6.0,
              "precip_mm": 1.2, "tomorrow": {"condition": "partlycloudy", "high": 4.0, "low": -3.0},
              "sunrise": "06:58", "sunset": "16:52"},
  "week": [{"day": "WED", "condition": "snowy", "high": 2.0, "low": -6.0}],
  "tv": {"state": "on", "source": "HDMI 2/ARC", "title": "Jellyfin", "volume": 23, "muted": false},
  "vacuum": {"state": "charging", "battery": 87, "error": null, "last_clean": "2026-11-10T17:10:00+00:00",
             "next_service": {"name": "Filter", "hours": 38}},
  "cards": [{"id": "vacuum", "title": "Roborock", "lines": ["Charging · 87%", "Last clean Tue 12:10", "Filter: 38 h left"], "tone": "good"},
            {"id": "tomorrow", "title": "Tomorrow", "lines": ["Partly cloudy", "High 4° · low -3°"], "tone": "info"},
            {"id": "homelab", "title": "Homelab", "lines": ["Homelab · all normal", "Pi 54°C · RAM 41% · disk 22%"], "tone": "good"}]
}
```

`launcher` holds the same data in the launcher's own theme format (`status`, `widgets`, `stack`; each widget is
`{eyebrow, big, lines[], tag, tag_accent, dot}`). The TV reads only this key (`HaFeed.java` in la-pulp/homelab-tv), so
a new card on the TV is a change here, not a launcher build.

Add a field: bump nothing, the launcher ignores unknown keys. Rename or remove one: bump `version`.

## Later (from the roadmap)

- Lab 05: secrets from Vault via ESO; move packages to a private `home-assistant-config` repo with git-sync
  before anything presence-related lands (this repo is public).
- Lab 06: daily backup copied to GCS. Lab 07: Tailscale name, then uncomment `http.trusted_proxies`.
- CI: run `hass --script check_config` in the pinned image on every PR.
