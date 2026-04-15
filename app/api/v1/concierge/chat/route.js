import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { verifyRoom, unauthorized, badRequest } from '@/lib/server-auth'

export async function POST(request) {
  const room = await verifyRoom(request)
  if (!room) return unauthorized('Room token required')

  const { message, history = [] } = await request.json()
  if (!message) return badRequest('Message is required')

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const systemPrompt = `You are a warm, professional AI concierge for ${process.env.HOTEL_NAME || 'Teacorps Hotel'}.
The guest is in Room ${room.roomNumber}.
Help with hotel services, local recommendations, and general questions.
Keep replies concise (2-4 sentences). Be friendly and helpful.
For urgent issues (medical, fire, safety), always direct them to use the Emergency button in the app.
Do not make up information about the hotel you don't know.`

    const messages = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    })

    const reply = response.content[0].text
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

    await db.aiConciergeLog.create({
      data: { roomId: room.id, message, response: reply, tokensUsed },
    })

    return Response.json({ reply, tokens_used: tokensUsed })
  } catch (err) {
    console.error('Concierge error:', err.message)
    return Response.json({
      reply: `Sorry, I'm having trouble right now. Please call reception at ${process.env.HOTEL_PHONE || 'the front desk'} for assistance.`,
      tokens_used: 0,
    })
  }
}
