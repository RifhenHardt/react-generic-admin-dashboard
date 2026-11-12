import { currentUser, isSameOrigin, json, readJson } from '../../../_lib/auth.js';

export async function onRequestPatch({ request, env, params }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'seller' || actor.status !== 'active') return json({ error: 'An active seller account is required.' }, 403);
  const body = await readJson(request, 2 * 1024 * 1024);
  const updates = {};
  for (const [key, column] of Object.entries({ title: 'title', category: 'category', event: 'event', booth: 'booth', price: 'price', stock: 'stock', reorderAt: 'reorder_at', imageUrl: 'image_url', description: 'description', status: 'status' })) {
    if (Object.hasOwn(body || {}, key)) updates[column] = key === 'price' || key === 'stock' || key === 'reorderAt' ? Number(body[key]) : String(body[key]);
  }
  if (!Object.keys(updates).length) return json({ error: 'No listing changes provided.' }, 400);
  const columns = Object.keys(updates);
  const query = `UPDATE market_listings SET ${columns.map((column) => `${column} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ? AND seller_user_id = ?`;
  const result = await env.DB.prepare(query).bind(...columns.map((column) => updates[column]), Number(params.id), actor.id).run();
  if (!result.meta.changes) return json({ error: 'Listing not found.' }, 404);
  return json({ success: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'seller') return json({ error: 'Seller access is required.' }, 403);
  const result = await env.DB.prepare('DELETE FROM market_listings WHERE id = ? AND seller_user_id = ?').bind(Number(params.id), actor.id).run();
  return result.meta.changes ? json({ success: true }) : json({ error: 'Listing not found.' }, 404);
}
