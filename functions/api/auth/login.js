import {
  createPasswordHash,
  isSameOrigin,
  json,
  publicUser,
  readJson,
  sessionCookie,
  sha256,
  storeSession,
} from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const body = await readJson(request);
  if (!body) return json({ error: 'Enter your email and password.' }, 400);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (email.length > 254 || password.length > 128) return json({ error: 'Email or password is incorrect.' }, 401);

  const now = new Date();
  const nowIso = now.toISOString();
  const emailHash = await sha256(email);
  const limit = await env.DB.prepare('SELECT failures, window_started_at, locked_until FROM login_limits WHERE email_hash = ?')
    .bind(emailHash).first();
  if (limit?.locked_until && limit.locked_until > nowIso) {
    return json({ error: 'Too many sign-in attempts. Wait 15 minutes and try again.' }, 429);
  }

  const recordFailure = async () => {
    const windowExpired = !limit || Date.parse(limit.window_started_at) <= now.getTime() - 15 * 60 * 1000;
    if (windowExpired) {
      await env.DB.prepare(`
        INSERT INTO login_limits (email_hash, failures, window_started_at, locked_until) VALUES (?, 1, ?, NULL)
        ON CONFLICT(email_hash) DO UPDATE SET failures = 1, window_started_at = excluded.window_started_at, locked_until = NULL
      `).bind(emailHash, nowIso).run();
      return;
    }

    const nextFailures = limit.failures + 1;
    const lockedUntil = nextFailures >= 5 ? new Date(now.getTime() + 15 * 60 * 1000).toISOString() : null;
    await env.DB.prepare('UPDATE login_limits SET failures = ?, locked_until = ? WHERE email_hash = ?')
      .bind(nextFailures, lockedUntil, emailHash).run();
  };

  const row = await env.DB.prepare(`
    SELECT id, name, email, password_hash, password_salt, role, team_name, status, created_at
    FROM users WHERE email = ? COLLATE NOCASE LIMIT 1
  `).bind(email).first();
  if (!row) {
    await createPasswordHash(password, '00000000000000000000000000000000');
    await recordFailure();
    return json({ error: 'Email or password is incorrect.' }, 401);
  }

  const suppliedHash = await createPasswordHash(password, row.password_salt);
  if (suppliedHash !== row.password_hash) {
    await recordFailure();
    return json({ error: 'Email or password is incorrect.' }, 401);
  }
  if (row.status === 'suspended') return json({ error: 'Email or password is incorrect.' }, 401);

  await env.DB.prepare('DELETE FROM login_limits WHERE email_hash = ?').bind(emailHash).run();
  const token = await storeSession(row.id, env);
  return json({ user: publicUser(row) }, 200, { 'Set-Cookie': sessionCookie(token) });
}
