import { currentUser, isSameOrigin, json, readJson } from '../../../_lib/auth.js';

const messageFields = `
  id, product_id AS productId, product_title AS productTitle, seller_team AS sellerTeam,
  sender_name AS senderName, sender_email AS senderEmail, message, response, status,
  created_at AS createdAt, replied_at AS repliedAt
`;

export async function onRequestGet({ request, env }) {
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);

  let result;
  if (actor.role === 'student') {
    result = await env.DB.prepare(`SELECT ${messageFields} FROM market_messages WHERE sender_user_id = ? ORDER BY created_at DESC`)
      .bind(actor.id).all();
  } else if (actor.role === 'seller') {
    result = await env.DB.prepare(`SELECT ${messageFields} FROM market_messages WHERE seller_team = ? ORDER BY created_at DESC`)
      .bind(actor.teamName).all();
  } else {
    return json({ error: 'Student or seller access is required.' }, 403);
  }
  return json({ messages: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'student') return json({ error: 'Only student accounts can contact sellers.' }, 403);
  if (actor.status !== 'active') return json({ error: 'Your account must be active to message sellers.' }, 403);

  const body = await readJson(request);
  const productId = String(body?.productId ?? '').trim();
  const productTitle = String(body?.productTitle ?? '').trim();
  const sellerTeam = String(body?.sellerTeam ?? '').trim();
  const message = String(body?.message ?? '').trim();
  if (!productId || productId.length > 80 || productTitle.length < 2 || productTitle.length > 160 || sellerTeam.length < 2 || sellerTeam.length > 100 || message.length < 1 || message.length > 500) {
    return json({ error: 'Enter a product and seller message (up to 500 characters).' }, 400);
  }

  const seller = await env.DB.prepare(`SELECT id FROM users WHERE role IN ('vendor', 'organizer') AND status = 'active' AND team_name = ? LIMIT 1`)
    .bind(sellerTeam).first();
  if (!seller) return json({ error: 'This seller team is not currently verified.' }, 404);

  const id = crypto.randomUUID();
  const result = await env.DB.prepare(`
    INSERT INTO market_messages (id, product_id, product_title, seller_team, sender_user_id, sender_name, sender_email, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, productId, productTitle, sellerTeam, actor.id, actor.name, actor.email, message).run();
  if (!result.success) return json({ error: 'Could not send your message. Please try again.' }, 500);

  const saved = await env.DB.prepare(`SELECT ${messageFields} FROM market_messages WHERE id = ?`).bind(id).first();
  return json({ message: saved }, 201);
}
