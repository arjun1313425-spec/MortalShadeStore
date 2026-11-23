# MortalShadeStore Architecture

## Goal

A purchase made on the website is verified by the backend, stored durably, and delivered by the correct Paper backend server. If the player is offline, the purchase stays queued until they next join.

## Components

1. **Website** — displays products and sends checkout requests to the backend.
2. **Backend API** — creates orders, verifies payment notifications with the payment provider, and stores delivery jobs.
3. **Central database** — stores orders and delivery state so jobs survive restarts.
4. **Paper delivery plugin** — installed on LifeSteal, Survival, BedWars, and PvP / Mini-Games. Each instance only claims jobs for its configured server ID.

Velocity routes players between backend servers. It does not need to be the component that executes purchase commands.

## Order lifecycle

`PENDING_PAYMENT → PAID → QUEUED → PROCESSING → DELIVERED`

A failed delivery should be recorded for inspection and safe retry. The system must use an idempotency key / unique delivery identifier so retries cannot grant a purchase twice.

## Server targeting

Each product must declare its destination server, for example:

- LifeSteal rank → LifeSteal
- Survival crate key → Survival
- BedWars product → BedWars
- PvP product → PvP / Mini-Games

The backend must validate the destination against an allowlist. A client/browser must not be allowed to choose arbitrary server commands.

## Offline players

The backend keeps the delivery job pending while the player is offline. The plugin processes it when the player is available on the matching backend server. Do not mark an order delivered until the command/action has been confirmed.

## Permissions and crates

LuckPerms contexts, group names, storage mode, and server identifiers must be inspected before implementing rank commands. Do not assume that granting a group without a server context is safe.

ExcellentCrates command syntax varies by version/configuration. Verify the installed version and command help before implementing crate delivery.

## Security

- Verify payment signatures server-side.
- Never trust a redirect/success page as proof of payment.
- Keep provider secrets and per-server tokens outside Git.
- Use HTTPS between the plugin and backend.
- Authenticate each server independently.
- Validate player identity and UUID, including Floodgate/Bedrock players.
- Log order IDs and outcomes without logging payment secrets.
