import { db } from '@/lib/db'
import { verifyRoom, unauthorized } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  const reservation = await db.reservation.findFirst({
    where: { roomId: room.id, status: 'active' },
    include: { guest: true },
    orderBy: { checkedInAt: 'desc' },
  })
  return Response.json({ room, reservation })
}
