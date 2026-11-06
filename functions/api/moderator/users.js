import { currentUser, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'admin') return json({ error: 'Admin access is required.' }, 403);

  const result = await env.DB.prepare(`
    SELECT id, name, email,
      CASE WHEN role = 'moderator' THEN 'admin' WHEN role IN ('vendor', 'organizer') THEN 'seller' ELSE role END AS role,
      team_name, status, created_at
    FROM users ORDER BY created_at DESC
  `).all();
  return json({ users: result.results || [] });
}
