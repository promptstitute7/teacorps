import { db } from '@/lib/db'
import { verifyRoom, unauthorized } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  const tickets = await db.ticket.findMany({
    where: { roomId: room.id },
    include: {
      events: { orderBy: { createdAt: 'asc' } },
      assignedStaff: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(tickets)
}
