import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const staffList = await db.staff.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, department: true, avatarUrl: true,
      avgRating: true, streakDays: true, badges: true,
      assignedTickets: {
        where: { status: 'completed', completedAt: { gte: startOfMonth } },
        select: { id: true },
      },
    },
    orderBy: { totalResolved: 'desc' },
  })

  const leaderboard = staffList
    .map((s) => ({
      id: s.id, name: s.name, department: s.department, avatarUrl: s.avatarUrl,
      resolvedThisMonth: s.assignedTickets.length,
      avgRating: s.avgRating, streakDays: s.streakDays, badges: s.badges,
    }))
    .sort((a, b) => b.resolvedThisMonth - a.resolvedThisMonth)

  return Response.json(leaderboard)
}
