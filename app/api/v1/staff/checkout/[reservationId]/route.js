import { db } from '@/lib/db'
import { verifyStaff, unauthorized, notFound, badRequest } from '@/lib/server-auth'

export async function POST(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const reservation = await db.reservation.findUnique({
    where: { id: params.reservationId },
    include: { room: { select: { roomNumber: true } }, guest: { select: { name: true } } },
  })

  if (!reservation) return notFound('Reservation not found')
  if (reservation.status !== 'active') return badRequest('Reservation is not active')

  const updated = await db.reservation.update({
    where: { id: params.reservationId },
    data: { status: 'checked_out', checkedOutAt: new Date() },
    include: {
      guest: { select: { name: true, phone: true } },
      room: { select: { roomNumber: true } },
    },
  })

  return Response.json(updated)
}
