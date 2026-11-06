import { currentUser, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: 'Sign in to continue.' }, 401);
  return json({ user });
}
