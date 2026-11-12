const SESSION_COOKIE = 'campus_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
// Cloudflare Workers Web Crypto supports PBKDF2 iteration counts up to 100,000.
const PASSWORD_HASH_ITERATIONS = 100000;
const encoder = new TextEncoder();

export function json(data, status = 200, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'same-origin');
  return new Response(JSON.stringify(data), { status, headers });
}

export function isSameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return false;
  return request.headers.get('Sec-Fetch-Site') !== 'cross-site';
}

export async function readJson(request, maxBytes = 8192) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > maxBytes) return null;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return toHex(new Uint8Array(digest));
}

export async function createPasswordHash(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: fromHex(saltHex),
    iterations: PASSWORD_HASH_ITERATIONS,
    hash: 'SHA-256',
  }, key, 256);
  return toHex(new Uint8Array(bits));
}

export function createSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export function createSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const value = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return value ? value.slice(name.length + 1) : null;
}

export function publicUser(row) {
  if (!row) return null;
  const role = row.role === 'moderator' ? 'admin' : ['vendor', 'organizer'].includes(row.role) ? 'seller' : row.role;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    teamName: row.team_name,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function currentUser(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(`
    SELECT users.id, users.name, users.email, users.role, users.team_name, users.status, users.created_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND users.status != 'suspended'
    LIMIT 1
  `).bind(tokenHash, new Date().toISOString()).first();
  return publicUser(row);
}

export async function storeSession(userId, env) {
  const token = createSessionToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(tokenHash, userId, expiresAt).run();
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(new Date().toISOString()).run();
  return token;
}

export async function deleteCurrentSession(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return;
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
}

export function methodNotAllowed() {
  return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, POST, PATCH' });
}
