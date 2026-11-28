export const SESSION_COOKIE = "__Host-ms_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}

export function redirect(url, headers = {}) {
  return new Response(null, { status: 302, headers: { location: url, "cache-control": "no-store", ...headers } });
}

export function randomToken(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return Array.from(data, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
}

export function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const item = part.trim();
    const index = item.indexOf("=");
    if (index > -1 && item.slice(0, index) === name) return item.slice(index + 1);
  }
  return null;
}

export function sessionCookie(value, maxAge = SESSION_SECONDS) {
  return `${SESSION_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export async function currentUser(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    "SELECT p.discord_id, p.username, p.global_name, p.avatar, s.expires_at FROM sessions s JOIN discord_players p ON p.discord_id = s.discord_id WHERE s.token_hash = ? AND s.expires_at > ?"
  ).bind(tokenHash, Math.floor(Date.now() / 1000)).first();
  return row || null;
}

export function siteOrigin(env) {
  return (env.SITE_ORIGIN || "https://mortalshadestore.pages.dev").replace(/\/$/, "");
}
