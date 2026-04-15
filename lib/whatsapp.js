const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_URL = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

async function send(payload) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn('[whatsapp] env vars missing — skipping message');
    return null;
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
  });
  const data = await res.json();
  if (!res.ok) console.error('[whatsapp] send error:', data);
  return data;
}

/**
 * Send check-in welcome message with QR room link.
 * Uses the hello_world template for sandbox testing.
 * Replace template name with your approved template in production.
 */
export async function sendCheckinWelcome({ to, guestName, roomNumber, qrLink }) {
  return send({
    to,
    type: 'template',
    template: {
      name: 'hello_world',
      language: { code: 'en_US' },
    },
  });
}

/**
 * Send ticket status update to guest.
 */
export async function sendTicketUpdate({ to, ticketNumber, status, category }) {
  const statusLabel = {
    acknowledged: 'acknowledged',
    in_progress: 'in progress',
    completed: 'completed',
  }[status] || status;

  const categoryLabel = category.replace(/_/g, ' ');

  return send({
    to,
    type: 'template',
    template: {
      name: 'ticket_update',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: categoryLabel },
            { type: 'text', text: ticketNumber },
            { type: 'text', text: statusLabel },
          ],
        },
      ],
    },
  });
}

/**
 * Send checkout review nudge with Google review link.
 */
export async function sendReviewNudge({ to, guestName, googleReviewUrl }) {
  return send({
    to,
    type: 'text',
    text: {
      body: `Hi ${guestName || 'there'}! Thank you for staying with us at Tea Corps. We hope you had a wonderful experience. We'd love your feedback — it takes just 30 seconds:\n\n${googleReviewUrl}\n\nSee you again soon! 🙏`,
    },
  });
}
