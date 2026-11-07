import { currentUser, isSameOrigin, json, readJson, sha256 } from '../../../_lib/auth.js';

const allowedStatuses = new Set(['active', 'pending verification', 'suspended']);

export async function onRequestPatch({ request, env, params }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'admin') return json({ error: 'Admin access is required.' }, 403);
  if (actor.id === params.id) return json({ error: 'You cannot change your own account status.' }, 400);

  const body = await readJson(request);
  const status = String(body?.status || '');
  if (!allowedStatuses.has(status)) return json({ error: 'Choose a valid account status.' }, 400);
  const result = await env.DB.prepare('UPDATE users SET status = ? WHERE id = ? AND role != ?').bind(status, params.id, 'moderator').run();
  if (!result.meta?.changes) return json({ error: 'Account not found.' }, 404);
  const user = await env.DB.prepare(`SELECT id, name, email,
    CASE WHEN role = 'moderator' THEN 'admin' WHEN role IN ('vendor', 'organizer') THEN 'seller' ELSE role END AS role,
    team_name, status, created_at FROM users WHERE id = ?`)
    .bind(params.id).first();
  return json({ user });
}

export async function onRequestDelete({ request, env, params }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'admin') return json({ error: 'Admin access is required.' }, 403);
  if (actor.id === params.id) return json({ error: 'You cannot delete your own admin account.' }, 400);

  const target = await env.DB.prepare('SELECT id, email, role, team_name FROM users WHERE id = ?').bind(params.id).first();
  if (!target) return json({ error: 'Account not found.' }, 404);
  if (target.role === 'moderator') return json({ error: 'Admin accounts are protected from deletion.' }, 403);

  const statements = [
    env.DB.prepare('DELETE FROM login_limits WHERE email_hash = ?').bind(await sha256(String(target.email).toLowerCase())),
  ];
  if (['vendor', 'organizer'].includes(target.role) && target.team_name) {
    const remainingSellers = await env.DB.prepare(`
      SELECT COUNT(*) AS count FROM users
      WHERE id != ? AND team_name = ? AND role IN ('vendor', 'organizer')
    `).bind(target.id, target.team_name).first();
    if (Number(remainingSellers?.count || 0) === 0) {
      statements.push(env.DB.prepare('DELETE FROM market_messages WHERE seller_team = ?').bind(target.team_name));
      statements.push(env.DB.prepare('DELETE FROM market_reviews WHERE seller_team = ?').bind(target.team_name));
    }
  }
  statements.push(env.DB.prepare('DELETE FROM users WHERE id = ? AND role != ?').bind(target.id, 'moderator'));

  const results = await env.DB.batch(statements);
  const deletion = results[results.length - 1];
  if (!deletion?.meta?.changes) return json({ error: 'Account could not be deleted.' }, 409);
  return json({ success: true, deletedUserId: target.id });
}
