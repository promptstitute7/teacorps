import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

// GET /api/v1/staff/chat — list rooms with active conversations
export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  // Find all active reservations that have at least one message
  const reservations = await db.reservation.findMany({
    where: { status: 'active', messages: { some: {} } },
    include: {
      room: { select: { id: true, roomNumber: true } },
      guest: { select: { name: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { checkedInAt: 'desc' },
  })

  // Attach unread count (guest messages not read by staff)
  const result = await Promise.all(
    reservations.map(async (res) => {
      const unread = await db.message.count({
        where: { reservationId: res.id, senderType: 'guest', readAt: null },
      })
      return {
        roomId: res.room.id,
        roomNumber: res.room.roomNumber,
        guestName: res.guest?.name || null,
        reservationId: res.id,
        lastMessage: res.messages[0] || null,
        unread,
      }
    })
  )

  // Sort: unread first, then by last message time
  result.sort((a, b) => {
    if (b.unread !== a.unread) return b.unread - a.unread
    const at = a.lastMessage?.createdAt ?? 0
    const bt = b.lastMessage?.createdAt ?? 0
    return new Date(bt) - new Date(at)
  })

  return Response.json(result)
}
