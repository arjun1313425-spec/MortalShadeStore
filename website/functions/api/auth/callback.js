import { json, redirect, randomToken, sha256, sessionCookie, SESSION_SECONDS, siteOrigin } from "../../../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DISCORD_REDIRECT_URI || !env.DB) {
    return json({ error: "Discord login is not configured yet." }, 503);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  if (oauthError) return redirect(siteOrigin(env) + "/?discord_login=cancelled");
  if (!code || !state || state.length > 256) return json({ error: "Invalid Discord callback." }, 400);

  const stateHash = await sha256(state);
  const validState = await env.DB.prepare(
    "DELETE FROM oauth_states WHERE state_hash = ? AND expires_at > ? RETURNING state_hash"
  ).bind(stateHash, Math.floor(Date.now() / 1000)).first();
  if (!validState) return json({ error: "Login session expired or invalid. Please try again." }, 400);

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: env.DISCORD_REDIRECT_URI
    })
  });
  if (!tokenResponse.ok) return json({ error: "Discord could not complete sign-in. Please try again." }, 502);
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) return json({ error: "Discord did not return an access token." }, 502);

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { authorization: `Bearer ${tokenData.access_token}` }
  });
  if (!userResponse.ok) return json({ error: "Could not retrieve your Discord profile." }, 502);
  const user = await userResponse.json();
  if (!user.id || !user.username) return json({ error: "Discord returned an incomplete profile." }, 502);

  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    "INSERT INTO discord_players (discord_id, username, global_name, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(discord_id) DO UPDATE SET username = excluded.username, global_name = excluded.global_name, avatar = excluded.avatar, updated_at = excluded.updated_at"
  ).bind(user.id, user.username, user.global_name || null, user.avatar || null, now, now).run();

  const session = randomToken(32);
  const sessionHash = await sha256(session);
  await env.DB.prepare("INSERT INTO sessions (token_hash, discord_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(sessionHash, user.id, now + SESSION_SECONDS, now).run();

  return redirect(siteOrigin(env) + "/?discord_login=success", {
    "set-cookie": sessionCookie(session),
    "referrer-policy": "no-referrer"
  });
}
