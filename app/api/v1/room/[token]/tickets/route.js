import { db } from '@/lib/db'
import { verifyRoom, unauthorized } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  // Find the currently active reservation for this room
  const reservation = await db.reservation.findFirst({
    where: { roomId: room.id, status: 'active' },
    orderBy: { checkedInAt: 'desc' },
  })

  // Only return tickets from the current guest's stay
  const tickets = await db.ticket.findMany({
    where: {
      roomId: room.id,
      reservationId: reservation?.id ?? '__none__', // if no active reservation, return nothing
    },
    include: {
      events: { orderBy: { createdAt: 'asc' } },
      assignedStaff: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(tickets)
}
