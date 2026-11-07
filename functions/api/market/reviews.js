import { currentUser, isSameOrigin, json, readJson } from '../../_lib/auth.js';

const reviewFields = `
  id, order_id AS orderId, product_id AS productId, product_title AS product,
  seller_team AS sellerTeam, student_name AS studentName, student_email AS studentEmail,
  rating, comment, created_at AS createdAt
`;

export async function onRequestGet({ request, env }) {
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);

  let result;
  if (actor.role === 'student') {
    result = await env.DB.prepare(`SELECT ${reviewFields} FROM market_reviews WHERE student_user_id = ? ORDER BY created_at DESC`)
      .bind(actor.id).all();
  } else if (actor.role === 'seller') {
    result = await env.DB.prepare(`SELECT ${reviewFields} FROM market_reviews WHERE seller_team = ? ORDER BY created_at DESC`)
      .bind(actor.teamName).all();
  } else {
    return json({ error: 'Student or seller access is required.' }, 403);
  }
  return json({ reviews: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'student') return json({ error: 'Only students can submit product feedback.' }, 403);
  if (actor.status !== 'active') return json({ error: 'Your account must be active to leave feedback.' }, 403);

  const body = await readJson(request);
  const orderId = String(body?.orderId ?? '').trim();
  const productId = String(body?.productId ?? '').trim();
  const productTitle = String(body?.productTitle ?? '').trim();
  const sellerTeam = String(body?.sellerTeam ?? '').trim();
  const rating = Number(body?.rating);
  const comment = String(body?.comment ?? '').trim();
  if (!orderId || orderId.length > 80 || !productId || productId.length > 80 || productTitle.length < 2 || productTitle.length > 160 || sellerTeam.length < 2 || sellerTeam.length > 100 || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 1 || comment.length > 500) {
    return json({ error: 'Enter a rating from 1 to 5 and a comment of up to 500 characters.' }, 400);
  }
  const seller = await env.DB.prepare(`SELECT id FROM users WHERE role IN ('vendor', 'organizer') AND status = 'active' AND team_name = ? LIMIT 1`)
    .bind(sellerTeam).first();
  if (!seller) return json({ error: 'This seller team is not currently verified.' }, 404);

  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(`
      INSERT INTO market_reviews (id, order_id, product_id, product_title, seller_team, student_user_id, student_name, student_email, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, orderId, productId, productTitle, sellerTeam, actor.id, actor.name, actor.email, rating, comment).run();
  } catch (error) {
    if (String(error?.message || '').toLowerCase().includes('unique')) {
      return json({ error: 'You already left feedback for this reservation.' }, 409);
    }
    return json({ error: 'Could not save your feedback. Please try again.' }, 500);
  }

  const review = await env.DB.prepare(`SELECT ${reviewFields} FROM market_reviews WHERE id = ?`).bind(id).first();
  return json({ review }, 201);
}
