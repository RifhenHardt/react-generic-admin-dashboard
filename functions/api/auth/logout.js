import { clearSessionCookie, deleteCurrentSession, isSameOrigin, json } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  await deleteCurrentSession(request, env);
  return json({ success: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}
