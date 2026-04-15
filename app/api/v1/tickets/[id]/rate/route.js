import { db } from '@/lib/db'
import { notFound, badRequest } from '@/lib/server-auth'

export async function POST(request, { params }) {
  const { rating, feedback } = await request.json()
  if (!rating || rating < 1 || rating > 5) return badRequest('Rating must be between 1 and 5')

  const ticket = await db.ticket.findUnique({ where: { id: params.id } })
  if (!ticket) return notFound('Ticket not found')
  if (ticket.status !== 'completed') return badRequest('Can only rate completed tickets')

  const updated = await db.ticket.update({
    where: { id: ticket.id },
    data: { guestRating: rating, guestFeedback: feedback ?? null },
  })

  await db.ticketEvent.create({
    data: { ticketId: ticket.id, eventType: 'rated', actorType: 'guest', newValue: String(rating), note: feedback ?? null },
  })

  if (ticket.assignedTo) {
    const staffTickets = await db.ticket.findMany({
      where: { assignedTo: ticket.assignedTo, guestRating: { not: null } },
      select: { guestRating: true },
    })
    const avg = staffTickets.reduce((s, t) => s + (t.guestRating || 0), 0) / staffTickets.length
    await db.staff.update({ where: { id: ticket.assignedTo }, data: { avgRating: Math.round(avg * 10) / 10 } })
  }

  return Response.json(updated)
}
