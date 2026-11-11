# 0002 · How people and the TV reach Home Assistant

Status: Accepted, 11 Nov 2026

## Context
Glo didn't want people using the Pi's LAN address. The TV isn't on the tailnet, the Giga Hub can't serve local DNS names, and the TV launcher only allows plain HTTP to one address. This repo is public, so real addresses and names stay in the private trackers (0003).

## Decision
| Who | Address | Why |
|---|---|---|
| Phones, Macs, browsers | `http://pi-node-1.<tailnet>:8123` | Tailscale already encrypts the traffic. One address works at home and away. Joy's devices use it once `pi-node-1` is shared into her tailnet |
| The TV launcher | `http://<pi-node-1 address>:8123` | The TV stays off the tailnet; its network config allows only this address |
| Home Assistant → the TV | `<tv address>` (Bravia, PiPup) | Same LAN; the URL lives in the `ha-secrets` Secret, not in Git |
| Later (Lab 07) | `https://ha.<tailnet>` | Its own name and a real certificate through the Tailscale operator, and Joy gets just that machine shared to her |

UFW opens 8123/tcp from the home LAN and `tailscale0` only, and mDNS (5353/udp) from the LAN.

## Consequences
- The LAN addresses rely on Giga Hub reservations (0003).
- Private values that the config needs (the TV's URL now, logins later) go in the `ha-secrets` Secret, created by hand and replaced by an ExternalSecret in Lab 05.
- Until onboarding is done, whoever opens 8123 first creates the owner account. Merge only when Glo and Joy can onboard together.

## Rejected
- The LAN address on phones.
- Tailscale on the TV: it costs RAM and changes the TV's routing.
- A Tailscale sidecar for HTTPS before Lab 07: an extra moving part when the operator does it properly later.
