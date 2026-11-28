import { json, getCookie, SESSION_COOKIE, sha256, sessionCookie } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const expected = (env.SITE_ORIGIN || "https://mortalshadestore.pages.dev").replace(/\/$/, "");
  if (origin && origin !== expected) return json({ error: "Invalid request origin." }, 403);
  const token = getCookie(request, SESSION_COOKIE);
  if (token && env.DB) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  }
  return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
}
