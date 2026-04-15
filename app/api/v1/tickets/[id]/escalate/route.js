import { db } from '@/lib/db'
import { notFound } from '@/lib/server-auth'

export async function POST(request, { params }) {
  const ticket = await db.ticket.findUnique({ where: { id: params.id } })
  if (!ticket) return notFound('Ticket not found')

  const updated = await db.ticket.update({
    where: { id: ticket.id },
    data: { status: 'escalated', escalatedAt: new Date(), escalationCount: ticket.escalationCount + 1 },
  })

  await db.ticketEvent.create({
    data: { ticketId: ticket.id, eventType: 'escalated', actorType: 'guest', oldValue: ticket.status, newValue: 'escalated' },
  })

  return Response.json(updated)
}
