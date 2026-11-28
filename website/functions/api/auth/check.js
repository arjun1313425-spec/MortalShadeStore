import { json } from "../../_lib/auth.js";

export async function onRequestGet({ env }) {
  return json({
    clientId: Boolean(env.DISCORD_CLIENT_ID),
    clientSecret: Boolean(env.DISCORD_CLIENT_SECRET),
    redirectUri: Boolean(env.DISCORD_REDIRECT_URI),
    siteOrigin: Boolean(env.SITE_ORIGIN),
    database: Boolean(env.DB)
  });
}
