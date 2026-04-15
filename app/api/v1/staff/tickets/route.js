import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const room = searchParams.get('room')
  const limit = Number(searchParams.get('limit') || 50)
  const offset = Number(searchParams.get('offset') || 0)

  const where = {}
  if (status) where.status = status
  if (category) where.category = category
  if (room) {
    const roomRec = await db.room.findFirst({ where: { roomNumber: room } })
    if (roomRec) where.roomId = roomRec.id
  }

  if (staff.role === 'staff' && staff.department && staff.department !== 'all') {
    const deptMap = { housekeeping: 'housekeeping', maintenance: 'maintenance', reception: 'front_desk' }
    const cat = deptMap[staff.department]
    if (cat && !where.category) where.category = cat
  }

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      include: {
        room: { select: { roomNumber: true, floor: true } },
        assignedStaff: { select: { id: true, name: true, department: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: limit, skip: offset,
    }),
    db.ticket.count({ where }),
  ])

  return Response.json({ tickets, total })
}
