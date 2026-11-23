# MortalShadeStore Architecture

## Goal

A website purchase is verified by the backend, stored durably, and delivered by the correct Paper backend server. If the player is offline, the purchase stays queued until they next join.

## Components

1. **Website** — displays products and sends checkout requests to the backend.
2. **Backend API** — creates orders, verifies payment notifications, and stores delivery jobs.
3. **Central database** — stores orders and delivery state so jobs survive restarts.
4. **Paper delivery plugin** — installed on LifeSteal, Survival, BedWars, and PvP / Mini-Games. Each instance only claims jobs for its configured server ID.

Velocity routes players between backend servers. It does not need to execute purchase commands itself.

## Order lifecycle

`PENDING_PAYMENT → PAID → QUEUED → PROCESSING → DELIVERED`

Failed deliveries must be recorded for inspection and safe retry. Use a unique delivery identifier so retries cannot grant the same purchase twice.

## Server targeting

Products must declare their destination server. Examples:

- LifeSteal rank → LifeSteal
- Survival crate key → Survival
- BedWars product → BedWars
- PvP product → PvP / Mini-Games

The backend validates destinations against an allowlist. The browser must never be allowed to submit arbitrary server commands.

## Offline players

The backend keeps a delivery job pending while the player is offline. The plugin processes it when the player is available on the matching backend server. Do not mark an order delivered until the action is confirmed.

## Permissions and crates

Inspect LuckPerms contexts, group names, storage mode, and server identifiers before implementing rank commands. Do not assume that a rank grant without a server context is safe.

ExcellentCrates command syntax depends on the installed version and configuration. Verify the installed version and command help before implementing crate delivery.

## Security

- Verify payment signatures server-side.
- Never trust a redirect/success page as proof of payment.
- Keep provider secrets and per-server tokens outside Git.
- Use HTTPS between plugin and backend.
- Authenticate each server independently.
- Validate player identity and UUID, including Floodgate/Bedrock players.
- Log order IDs and outcomes without logging payment secrets.
