import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [tickets, completedToday] = await Promise.all([
    db.ticket.findMany({
      where: { assignedTo: staff.id, status: { not: 'completed' } },
      include: {
        room: { select: { roomNumber: true } },
        events: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.ticket.count({
      where: { assignedTo: staff.id, status: 'completed', completedAt: { gte: today } },
    }),
  ])

  return Response.json({ tickets, completedToday })
}
