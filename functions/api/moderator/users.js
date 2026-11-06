import { currentUser, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'moderator') return json({ error: 'Moderator access is required.' }, 403);

  const result = await env.DB.prepare(`
    SELECT id, name, email, role, team_name, status, created_at
    FROM users ORDER BY created_at DESC
  `).all();
  return json({ users: result.results || [] });
}
