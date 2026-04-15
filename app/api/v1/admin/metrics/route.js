import { db } from '@/lib/db'
import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('from') ? new Date(searchParams.get('from')) : (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
  const end = searchParams.get('to') ? new Date(searchParams.get('to')) : new Date()

  const [total, resolved, escalated, allTickets] = await Promise.all([
    db.ticket.count({ where: { createdAt: { gte: start, lte: end } } }),
    db.ticket.count({ where: { status: 'completed', completedAt: { gte: start, lte: end } } }),
    db.ticket.count({ where: { escalationCount: { gt: 0 }, createdAt: { gte: start, lte: end } } }),
    db.ticket.findMany({
      where: { status: 'completed', completedAt: { gte: start, lte: end } },
      select: { createdAt: true, completedAt: true },
    }),
  ])

  const avgResponseMs = allTickets.length > 0
    ? allTickets.reduce((s, t) => s + (new Date(t.completedAt) - new Date(t.createdAt)), 0) / allTickets.length
    : 0

  return Response.json({
    totalTickets: total, resolved,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    avgResponseMinutes: Math.round(avgResponseMs / 60000),
    escalationRate: total > 0 ? Math.round((escalated / total) * 100) : 0,
    escalated,
  })
}
