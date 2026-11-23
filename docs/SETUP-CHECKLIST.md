# Setup Checklist

Complete these checks before writing production delivery commands.

## Minecraft servers

Run these checks on each Paper backend: LifeSteal, Survival, BedWars, and PvP / Mini-Games.

- [ ] Run `lp info` and record the LuckPerms version and storage information.
- [ ] Open `plugins/LuckPerms/config.yml` and record `server:` and `storage-method:`.
- [ ] Record the exact LuckPerms group names used for store ranks.
- [ ] Confirm whether the four servers share LuckPerms storage.
- [ ] Check the ExcellentCrates version (console: `version ExcellentCrates`, or inspect the plugin JAR filename).
- [ ] Confirm the exact crate/key give command from the installed plugin's help.
- [ ] Confirm Geyser/Floodgate setup and how Bedrock player UUIDs are represented.

Do not post passwords, database credentials, private keys, or API tokens in chat or in this repository.

## Payments

- [ ] Choose a provider that accepts merchants based in the store owner's country.
- [ ] Confirm supported customer payment methods and currencies.
- [ ] Confirm webhook/signature verification support.
- [ ] Record provider fees and settlement requirements.

## Hosting and domain

- [ ] Choose static website hosting.
- [ ] Choose backend/API hosting with persistent database support.
- [ ] Configure a custom domain and HTTPS.
- [ ] Configure backups and monitoring.

## Test cases

- [ ] Java player online on the destination server.
- [ ] Java player offline at payment time, then joins later.
- [ ] Bedrock player purchase.
- [ ] Player is online on a different backend server.
- [ ] Plugin/backend restart while an order is queued.
- [ ] Payment webhook is delivered more than once.
- [ ] Delivery attempt fails and is retried without duplicate rewards.
