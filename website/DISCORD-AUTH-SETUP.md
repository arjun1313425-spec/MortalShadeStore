# MortalShade Discord login setup

The Pages Functions in this folder implement Discord OAuth2 login. The Discord Client Secret must only be stored as a Cloudflare secret; never commit it to Git.

## 1. Cloudflare Pages project settings

This repository serves the static site from the `website` folder. In the Cloudflare Pages project, set the project root to `website` and the build output directory to `.`. Keep the existing Git production branch as `main`.

## 2. Create the D1 database

1. Cloudflare Dashboard → Workers & Pages → D1 SQL Database → Create.
2. Name it `mortalshade-auth`.
3. Copy its Database ID.
4. Replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.toml` with that ID.
5. In the D1 database Console, run the complete SQL from `migrations/0001_discord_auth.sql`.

## 3. Add Pages environment variables

In Cloudflare Dashboard → Workers & Pages → mortalshade-store → Settings → Variables and Secrets, add these for **Production**:

- `DISCORD_CLIENT_ID` (Text): your Discord application's Client ID.
- `DISCORD_CLIENT_SECRET` (Secret): create/reset the secret in Discord OAuth2 General and paste it directly into this Cloudflare Secret field. Do not send it in chat or put it in GitHub.
- `DISCORD_REDIRECT_URI` (Text): `https://mortalshadestore.pages.dev/api/auth/discord/callback`
- `SITE_ORIGIN` (Text): `https://mortalshadestore.pages.dev`

Add a D1 binding named `DB` pointing to `mortalshade-auth` under the Pages project's Settings → Functions → D1 database bindings. If your Cloudflare dashboard offers bindings through the Wrangler configuration, use the `DB` binding in `wrangler.toml` instead. Do not create two bindings with the same name.

## 4. Deploy and test

Push the updated `main` branch and wait for the Pages production deployment. Then open the site, choose Player Login → Continue with Discord, approve the requested `identify` permission, and confirm the profile is shown as signed in. Test sign-out too.

## Endpoints

- `GET /api/auth/discord/start` — creates a one-time state and redirects to Discord.
- `GET /api/auth/discord/callback` — validates state, exchanges the code server-side, and creates a secure session.
- `GET /api/auth/me` — returns the signed-in Discord profile.
- `POST /api/auth/logout` — revokes the current session.

Sessions use a random opaque token in a Secure, HttpOnly, SameSite=Lax cookie. Only its SHA-256 hash is stored in D1. OAuth state is also hashed and expires after ten minutes. This first version identifies the Discord account only; it does not grant Discord server roles or link Minecraft yet.
