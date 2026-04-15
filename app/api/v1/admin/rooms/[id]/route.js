import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden, notFound } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const room = await db.room.findUnique({
    where: { id: params.id },
    include: {
      tickets: {
        orderBy: { createdAt: 'desc' }, take: 20,
        include: { assignedStaff: { select: { name: true } } },
      },
    },
  })
  if (!room) return notFound('Room not found')
  return Response.json(room)
}

export async function PATCH(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()

  const { floor, roomType, isActive } = await request.json()
  const room = await db.room.update({ where: { id: params.id }, data: { floor, roomType, isActive } })
  return Response.json(room)
}
