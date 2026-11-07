import { currentUser, isSameOrigin, json, readJson } from '../../../_lib/auth.js';

export async function onRequestPatch({ request, env, params }) {
  if (!isSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  const actor = await currentUser(request, env);
  if (!actor) return json({ error: 'Sign in to continue.' }, 401);
  if (actor.role !== 'seller') return json({ error: 'Seller access is required to reply.' }, 403);
  if (actor.status !== 'active') return json({ error: 'Your seller account must be active to reply.' }, 403);

  const body = await readJson(request);
  const response = String(body?.response ?? '').trim();
  if (response.length < 1 || response.length > 500) return json({ error: 'Write a reply of up to 500 characters.' }, 400);

  const result = await env.DB.prepare(`
    UPDATE market_messages SET response = ?, status = 'replied', replied_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ? AND seller_team = ?
  `).bind(response, params.id, actor.teamName).run();
  if (!result.meta?.changes) return json({ error: 'Message not found in your seller inbox.' }, 404);

  const message = await env.DB.prepare(`
    SELECT id, product_id AS productId, product_title AS productTitle, seller_team AS sellerTeam,
      sender_name AS senderName, sender_email AS senderEmail, message, response, status,
      created_at AS createdAt, replied_at AS repliedAt
    FROM market_messages WHERE id = ?
  `).bind(params.id).first();
  return json({ message });
}
