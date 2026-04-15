import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const { searchParams } = new URL(request.url)
  const where = { escalationCount: { gt: 0 } }

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const category = searchParams.get('category')
  if (category) where.category = category

  const room = searchParams.get('room')
  if (room) {
    const r = await db.room.findFirst({ where: { roomNumber: room } })
    if (r) where.roomId = r.id
  }

  const tickets = await db.ticket.findMany({
    where,
    include: {
      room: { select: { roomNumber: true } },
      assignedStaff: { select: { name: true } },
    },
    orderBy: { escalatedAt: 'desc' },
    take: 100,
  })
  return Response.json(tickets)
}
