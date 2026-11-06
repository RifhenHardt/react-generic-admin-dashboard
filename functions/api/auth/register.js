import {
  createPasswordHash,
  createSalt,
  isSameOrigin,
  json,
  publicUser,
  readJson,
  sessionCookie,
  storeSession,
} from '../../_lib/auth.js';

const allowedRoles = new Set(['student', 'vendor', 'organizer', 'moderator']);

function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) difference |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  return difference === 0;
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const body = await readJson(request);
  if (!body) return json({ error: 'Enter valid account details.' }, 400);

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const role = String(body.role || '');
  const teamName = String(body.teamName || '').trim();

  if (name.length < 2 || name.length > 80) return json({ error: 'Name must be between 2 and 80 characters.' }, 400);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400);
  if (password.length < 10 || password.length > 128) return json({ error: 'Password must be 10 to 128 characters.' }, 400);
  if (!allowedRoles.has(role)) return json({ error: 'Choose a supported account type.' }, 400);
  if ((role === 'vendor' || role === 'organizer') && (teamName.length < 2 || teamName.length > 100)) {
    return json({ error: 'Enter your vendor, class, or project team name.' }, 400);
  }

  const domains = String(env.CAMPUS_EMAIL_DOMAINS || '').split(',').map((domain) => domain.trim().toLowerCase().replace(/^@/, '')).filter(Boolean);
  if (domains.length && !domains.includes(email.split('@')[1])) {
    return json({ error: `Use an email address from: ${domains.map((domain) => `@${domain}`).join(', ')}.` }, 400);
  }

  if (role === 'moderator' && (!env.STAFF_INVITE_CODE || !constantTimeEqual(String(body.inviteCode || ''), String(env.STAFF_INVITE_CODE)))) {
    return json({ error: 'A valid staff invite code is required for moderator accounts.' }, 403);
  }

  const salt = createSalt();
  const passwordHash = await createPasswordHash(password, salt);
  const id = crypto.randomUUID();
  const status = role === 'vendor' || role === 'organizer' ? 'pending verification' : 'active';

  try {
    await env.DB.prepare(`
      INSERT INTO users (id, name, email, password_hash, password_salt, role, team_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, name, email, passwordHash, salt, role, teamName, status).run();
  } catch (error) {
    if (String(error?.message || '').toLowerCase().includes('unique')) {
      return json({ error: 'An account with that email already exists. Try signing in.' }, 409);
    }
    return json({ error: 'Account creation failed. Please try again.' }, 500);
  }

  const user = await env.DB.prepare('SELECT id, name, email, role, team_name, status, created_at FROM users WHERE id = ?')
    .bind(id).first();
  const token = await storeSession(id, env);
  return json({ user: publicUser(user) }, 201, { 'Set-Cookie': sessionCookie(token) });
}
