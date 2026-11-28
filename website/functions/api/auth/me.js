import { json, currentUser } from "../../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ authenticated: false, configured: false }, 503);
  const user = await currentUser(request, env);
  if (!user) return json({ authenticated: false });
  return json({
    authenticated: true,
    user: {
      id: user.discord_id,
      username: user.username,
      globalName: user.global_name,
      avatar: user.avatar
    }
  });
}
