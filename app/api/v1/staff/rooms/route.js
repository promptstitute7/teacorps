import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const rooms = await db.room.findMany({
    where: { isActive: true },
    include: {
      tickets: {
        where: { status: { notIn: ['completed', 'cancelled'] } },
        select: { id: true, status: true, priority: true, category: true },
      },
      reservations: {
        where: { status: 'active' },
        include: { guest: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { roomNumber: 'asc' },
  })

  return Response.json(rooms)
}
