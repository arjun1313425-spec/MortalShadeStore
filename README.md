# MortalShadeStore

Custom webstore and multi-server delivery system for MortalShade Network.

## Network
- Velocity proxy
- Paper 1.21 backends: LifeSteal, Survival, BedWars, PvP / Mini-Games
- LuckPerms on all backends
- ExcellentCrates
- Geyser + Floodgate for Bedrock players

## Project milestones
1. Build the storefront UI.
2. Add a secure backend and persistent order database.
3. Integrate a supported payment provider after merchant eligibility is confirmed.
4. Build the Paper delivery plugin with server-specific routing and offline-player queues.
5. Test duplicate protection, payment verification, and Java/Bedrock identity handling.

## Current status
Milestone 1 is a frontend scaffold. Product prices, exact packages, payment methods, and live checkout are intentionally not configured yet. No payments are collected by this frontend.

## Project structure
- `website/`: static storefront frontend
- `backend/`: planned payment verification and order API
- `delivery-plugin/`: planned Paper delivery plugin
- `docs/`: architecture and setup notes

Never commit API keys, payment secrets, server tokens, or production credentials.
