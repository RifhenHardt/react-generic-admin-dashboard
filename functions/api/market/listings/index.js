import { currentUser, isSameOrigin, json, readJson } from '../../../_lib/auth.js';

const fields = `id, seller_user_id AS sellerUserId, seller_name AS sellerName, seller_team AS sellerTeam, title, category, event, booth, price, stock, reorder_at AS reorderAt, image_url AS imageUrl, description, seller_verified AS sellerVerified, status, submission_date AS submissionDate`;

export async function onRequestGet({ request, env }) {
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  const result = actor.role === 'seller'
    ? await env.DB.prepare(`SELECT ${fields} FROM market_listings WHERE (status = 'active' AND stock > 0) OR seller_user_id = ? ORDER BY created_at DESC`).bind(actor.id).all()
    : await env.DB.prepare(`SELECT ${fields} FROM market_listings WHERE status = 'active' AND stock > 0 ORDER BY created_at DESC`).all();
  return json({ listings: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'seller' || actor.status !== 'active') return json({ error: 'An active seller account is required.' }, 403);
  const body = await readJson(request, 2 * 1024 * 1024);
  const title = String(body?.title || '').trim();
  const category = String(body?.category || '').trim();
  if (title.length < 2 || title.length > 100 || !category || !String(body?.event || '').trim() || !String(body?.booth || '').trim() || !String(body?.description || '').trim() || !(Number(body?.price) > 0) || !(Number(body?.stock) > 0)) return json({ error: 'Complete all product details with a positive price and stock.' }, 400);
  const result = await env.DB.prepare(`INSERT INTO market_listings (seller_user_id, seller_name, seller_team, title, category, event, booth, price, stock, reorder_at, image_url, description, seller_verified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active')`)
    .bind(actor.id, actor.name, actor.teamName, title, category, String(body.event).trim(), String(body.booth).trim(), Number(body.price), Number(body.stock), Number(body.reorderAt || 0), String(body.imageUrl || ''), String(body.description).trim()).run();
  if (!result.success) return json({ error: 'Could not save the listing.' }, 500);
  const listing = await env.DB.prepare(`SELECT ${fields} FROM market_listings WHERE id = ?`).bind(result.meta.last_row_id).first();
  return json({ listing }, 201);
}
