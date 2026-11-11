# 0003 · LAN address plan for both Pis

Status: Accepted, 11 Nov 2026 · Same record in Joy's `platform-docs` (Lab 04b)

## Context
Both Pis share the Bell Giga Hub's home LAN. Joy's MetalLB pool once clashed with `pi-node-1`'s address. Home Assistant and the TV feed depend on fixed addresses.

This repo is public, so **it never holds real addresses or ranges**. This record names the blocks and who uses them. The actual numbers are in the private Pi 5 Homelab tracker (Map → Home network, Labs → Open items).

## Decision
| Block | Use |
|---|---|
| DHCP pool | The Giga Hub hands these out. Devices that need a fixed address get a reservation inside it |
| Homelab block | Above the DHCP pool, never handed out: fixed addresses and load-balancer pools, no reservation needed |

### pi-node-1 (Glo's Pi) and what it depends on
| Device | Block | How it's fixed | Used by |
|---|---|---|---|
| `pi-node-1` | Homelab block | Reservation too | K3s node, ssh, TV feed URL |
| Bravia TV | DHCP pool | Reservation | HA's Bravia integration, PiPup |
| Patricia (Roborock) | DHCP pool | Reservation, to add | HA's Roborock integration |
| Glo's Mac mini | DHCP pool | Reservation | ssh, Terraform, Ansible |
| Zigbee coordinator | Homelab block | Fixed, on arrival | Zigbee2MQTT |

### joy-pi (Joy's Pi) and what it depends on
| Device | Block | How it's fixed | Used by |
|---|---|---|---|
| `joy-pi` | DHCP pool | Reservation | K3s node, ssh, household app |
| Joy's Mac mini | DHCP pool | Reservation | ssh, Terraform, Ansible |
| Joy's MetalLB pool | Homelab block | Fixed range, to move | Envoy Gateway, metrics (0004) |

Notes: the Bravia is wired through its USB adapter (`eth1`), and Jellyfin's TV NodePort comes later on `pi-node-1`. Joy's MetalLB pool sits inside the DHCP pool today and moves to a free range in the homelab block. Actual, Pocket ID and the metrics stack (0004) also run on `joy-pi`. Tailnet names don't depend on any of these, and Joy's apps reach Glo through tailnet shares.

## Consequences
- Joy moves her MetalLB pool into the homelab block. That's her change, in her platform repos. Until then the hub can hand one of those addresses to another device, and both lose traffic.
- New homelab devices take a fixed address in the homelab block and get a row here (by name) and in the private tracker (with the number).
- Changing `pi-node-1`'s address means touching the TV launcher, ssh configs, Ansible, the preflight script, the `ha-secrets` Secret and the trackers. Do it only as a planned renumbering (see 0005).
- Configs in this repo use placeholders (`<pi-node-1 address>`, `<tv address>`) or values from Secrets, never literal addresses.

## Rejected
- Moving the DHCP pool or renumbering existing devices: most already have stable addresses.
- Reserving MetalLB's addresses on the hub: reservations need a MAC address, and a pool has none.
- Real addresses in this public repo, even private LAN ones: they publish a map of the home network.
