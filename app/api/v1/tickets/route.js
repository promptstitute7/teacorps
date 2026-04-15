import { db } from '@/lib/db'
import { verifyRoom, unauthorized, badRequest } from '@/lib/server-auth'

async function generateTicketNumber() {
  const count = await db.ticket.count()
  return `TRP-${String(count + 1).padStart(4, '0')}`
}

async function calculateSlaDeadline(category) {
  const sla = await db.slaSettings.findUnique({ where: { category } })
  const minutes = sla ? sla.slaMinutes : 20
  return new Date(Date.now() + minutes * 60 * 1000)
}

export async function POST(request) {
  const room = await verifyRoom(request)
  if (!room) return unauthorized('Room token required')

  const { category, subcategory, description, items, priority: reqPriority, guestId } = await request.json()
  if (!category) return badRequest('Category is required')

  let priority = reqPriority || 'medium'
  if (category === 'emergency') priority = 'emergency'
  if (subcategory && ['room_lock', 'electrical'].includes(subcategory)) priority = 'high'

  const reservation = await db.reservation.findFirst({
    where: { roomId: room.id, status: 'active' },
    orderBy: { checkedInAt: 'desc' },
  })

  const ticketNumber = await generateTicketNumber()
  const slaDeadline = await calculateSlaDeadline(category)

  const ticket = await db.ticket.create({
    data: {
      ticketNumber, roomId: room.id,
      reservationId: reservation?.id ?? null,
      guestId: guestId ?? reservation?.guestId ?? null,
      category, subcategory: subcategory ?? null,
      description: description ?? null,
      items: items ?? null,
      priority, status: 'new', slaDeadline,
    },
  })

  await db.ticketEvent.create({
    data: { ticketId: ticket.id, eventType: 'created', actorType: 'guest', newValue: 'new' },
  })

  return Response.json(ticket, { status: 201 })
}
