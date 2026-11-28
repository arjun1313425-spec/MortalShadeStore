import { json, redirect, randomToken, sha256, siteOrigin } from "../../../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DISCORD_REDIRECT_URI || !env.DB) {
    return json({ error: "Discord login is not configured yet. Complete the Cloudflare setup first." }, 503);
  }

  const state = randomToken(32);
  const expiresAt = Math.floor(Date.now() / 1000) + 600;
  await env.DB.prepare("INSERT INTO oauth_states (state_hash, expires_at) VALUES (?, ?)")
    .bind(await sha256(state), expiresAt).run();

  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", env.DISCORD_REDIRECT_URI);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "identify");
  authorize.searchParams.set("state", state);

  const url = new URL(request.url);
  if (url.origin !== siteOrigin(env)) return json({ error: "Unexpected site origin." }, 400);
  return redirect(authorize.toString());
}
