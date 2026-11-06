import { currentUser, isSameOrigin, json, readJson } from '../../../_lib/auth.js';

const allowedStatuses = new Set(['active', 'pending verification', 'suspended']);

export async function onRequestPatch({ request, env, params }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'moderator') return json({ error: 'Moderator access is required.' }, 403);
  if (actor.id === params.id) return json({ error: 'You cannot change your own account status.' }, 400);

  const body = await readJson(request);
  const status = String(body?.status || '');
  if (!allowedStatuses.has(status)) return json({ error: 'Choose a valid account status.' }, 400);
  const result = await env.DB.prepare('UPDATE users SET status = ? WHERE id = ? AND role != ?').bind(status, params.id, 'moderator').run();
  if (!result.meta?.changes) return json({ error: 'Account not found.' }, 404);
  const user = await env.DB.prepare('SELECT id, name, email, role, team_name, status, created_at FROM users WHERE id = ?')
    .bind(params.id).first();
  return json({ user });
}
