import { db } from '@/lib/db'
import { verifyStaff, unauthorized, badRequest, notFound } from '@/lib/server-auth'

async function getActiveReservation(roomId) {
  return db.reservation.findFirst({
    where: { roomId, status: 'active' },
    orderBy: { checkedInAt: 'desc' },
  })
}

// GET /api/v1/staff/chat/[roomId] — fetch messages for a room
export async function GET(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const room = await db.room.findUnique({ where: { id: params.roomId } })
  if (!room) return notFound('Room not found')

  const reservation = await getActiveReservation(room.id)
  if (!reservation) return Response.json([])

  // Mark guest messages as read by staff
  await db.message.updateMany({
    where: { reservationId: reservation.id, senderType: 'guest', readAt: null },
    data: { readAt: new Date() },
  })

  const messages = await db.message.findMany({
    where: { reservationId: reservation.id },
    orderBy: { createdAt: 'asc' },
  })

  return Response.json({ messages, reservation: { id: reservation.id, roomNumber: room.roomNumber } })
}

// POST /api/v1/staff/chat/[roomId] — staff sends a message
export async function POST(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const room = await db.room.findUnique({ where: { id: params.roomId } })
  if (!room) return notFound('Room not found')

  const reservation = await getActiveReservation(room.id)
  if (!reservation) return badRequest('No active reservation for this room')

  const { body } = await request.json()
  if (!body?.trim()) return badRequest('Message body required')

  const message = await db.message.create({
    data: {
      roomId: room.id,
      reservationId: reservation.id,
      senderType: 'staff',
      senderName: staff.name,
      body: body.trim(),
    },
  })

  return Response.json(message, { status: 201 })
}
