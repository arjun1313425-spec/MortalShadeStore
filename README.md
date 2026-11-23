# MortalShadeStore

Official custom webstore and multi-server delivery system for **MortalShade Network**.

The goal is to build a self-managed Minecraft storefront with a custom checkout, durable order records, and reliable in-game delivery.

## Network environment

- Proxy: Velocity
- Backend servers: LifeSteal, Survival, BedWars, PvP / Mini-Games
- Server software: Paper 1.21
- Permissions: LuckPerms
- Crates: ExcellentCrates
- Bedrock support: Geyser + Floodgate

## Planned components

| Directory | Purpose |
| --- | --- |
| `website/` | Storefront, product pages, cart, and checkout UI |
| `backend/` | Order API, payment verification, and delivery queue |
| `delivery-plugin/` | Paper plugin for server-specific purchase delivery |
| `docs/` | Setup guides, architecture, and operational notes |

## Core requirements

- Route every product to its correct backend server.
- Keep paid orders queued while a player is offline.
- Make delivery safe to retry without granting the same purchase twice.
- Verify payments on the backend; a browser success page is not proof of payment.
- Never commit API keys, passwords, database credentials, or server tokens.
- Handle Java and Bedrock player identities using reliable UUID information.

## Development status

Initial repository setup. No payment provider, production backend, website deployment, or Minecraft delivery plugin has been configured yet.

## Next setup checks

1. Confirm LuckPerms storage method, server identifiers, and rank group names on all four servers.
2. Confirm the installed ExcellentCrates version and exact give-key command.
3. Choose a payment provider that supports the merchant's country and customer payment methods.
4. Configure hosting, HTTPS, secrets, backups, and payment webhook verification.
5. Test online, offline, Java, and Bedrock purchases before launch.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/SETUP-CHECKLIST.md](docs/SETUP-CHECKLIST.md).
