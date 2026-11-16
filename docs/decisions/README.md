# Decision records

One file per decision, numbered in order. Each one has Context, Decision, Consequences and Rejected.
To change a decision, write a new record that replaces the old one, and mark the old one "Superseded by NNNN".
Joy's platform keeps its own records in `somepulp/platform-docs`. Decisions that cover both Pis (like 0003) go in both repos.

| # | Decision | Status |
|---|---|---|
| [0001](0001-home-assistant-on-k3s.md) | Home Assistant on K3s, config in Git, no secrets | Accepted, 11 Nov 2026 |
| [0002](0002-home-assistant-addresses.md) | How people and the TV reach Home Assistant | Accepted, 11 Nov 2026 |
| [0003](0003-lan-ip-plan.md) | LAN address plan for both Pis (no real addresses here) | Accepted, 11 Nov 2026 |
| [0004](0004-workload-placement.md) | What runs on which Pi, the RAM budget; joy-pi owns metrics | Accepted, 11 Nov 2026 |
| [0005](0005-node-naming.md) | Node naming: keep `pi-node-1` | Accepted, 11 Nov 2026 |

This repo is public: records never contain real IP addresses, ranges or tailnet names. Those live in the private trackers.
