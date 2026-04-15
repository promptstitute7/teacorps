import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const s = await verifyStaff(request)
  if (!s) return unauthorized()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayResolved = await db.ticket.count({
    where: { assignedTo: s.id, status: 'completed', completedAt: { gte: today } },
  })

  return Response.json({
    id: s.id, name: s.name, email: s.email, role: s.role,
    department: s.department, avatarUrl: s.avatarUrl,
    totalResolved: s.totalResolved, avgRating: s.avgRating,
    streakDays: s.streakDays, badges: s.badges, todayResolved,
  })
}
