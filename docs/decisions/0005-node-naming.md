# 0005 · Node naming: keep `pi-node-1`

Status: Accepted, 11 Nov 2026

## Context
Joy's Pi is `joy-pi`. Renaming Glo's to `glo-pi` was considered. More Pi nodes are likely next year.

## Decision
Keep `pi-node-1`. Future nodes in this cluster are `pi-node-2`, `pi-node-3` and so on. Ownership shows in the tailnet and the repo, not the hostname.

## Consequences
- The name works for a multi-node cluster.
- A rename, if ever wanted, happens during a rebuild (Lab 04's drill or when node 2 joins), not on the running node.

## Rejected
- `glo-pi` now. K3s registers the node by hostname, so a rename creates a new node, and the `local-path` volumes (pill reminder, later Home Assistant) are pinned to `pi-node-1`. It also changes the tailnet name that is now the Home Assistant address, the ssh configs and Joy's share.
