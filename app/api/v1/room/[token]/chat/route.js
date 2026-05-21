import { db } from '@/lib/db'
import { verifyRoom, unauthorized, badRequest } from '@/lib/server-auth'

async function getActiveReservation(roomId) {
  return db.reservation.findFirst({
    where: { roomId, status: 'active' },
    orderBy: { checkedInAt: 'desc' },
  })
}

export async function GET(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  const reservation = await getActiveReservation(room.id)
  if (!reservation) return Response.json([])

  // Mark staff messages as read
  await db.message.updateMany({
    where: { reservationId: reservation.id, senderType: 'staff', readAt: null },
    data: { readAt: new Date() },
  })

  const messages = await db.message.findMany({
    where: { reservationId: reservation.id },
    orderBy: { createdAt: 'asc' },
  })

  return Response.json(messages)
}

export async function POST(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  const reservation = await getActiveReservation(room.id)
  if (!reservation) return badRequest('No active reservation')

  const { body } = await request.json()
  if (!body?.trim()) return badRequest('Message body required')

  const message = await db.message.create({
    data: {
      roomId: room.id,
      reservationId: reservation.id,
      senderType: 'guest',
      body: body.trim(),
    },
  })

  return Response.json(message, { status: 201 })
}
