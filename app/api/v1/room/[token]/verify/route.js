import { db } from '@/lib/db'
import { verifyRoom, unauthorized, badRequest } from '@/lib/server-auth'

function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits
}

export async function POST(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  const { phone } = await request.json()
  if (!phone?.trim()) return badRequest('Phone number is required')

  const normalized = normalizePhone(phone)

  const reservation = await db.reservation.findFirst({
    where: { roomId: room.id, status: 'active' },
    orderBy: { checkedInAt: 'desc' },
    include: {
      guest: { select: { name: true, phone: true } },
    },
  })

  if (!reservation) {
    return Response.json({ error: 'No active reservation for this room' }, { status: 404 })
  }

  const guestPhone = normalizePhone(reservation.guest?.phone || '')
  if (guestPhone !== normalized) {
    return Response.json({ error: 'Phone number does not match this room\'s reservation' }, { status: 401 })
  }

  return Response.json({
    reservationId: reservation.id,
    guestName: reservation.guest.name,
    checkOutDate: reservation.checkOutDate,
    roomNumber: room.roomNumber,
  })
}
