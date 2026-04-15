import { verifyStaff, unauthorized } from '@/lib/server-auth'

export async function GET(request) {
  const s = await verifyStaff(request)
  if (!s) return unauthorized()
  return Response.json({
    id: s.id, name: s.name, email: s.email, role: s.role,
    department: s.department, avatarUrl: s.avatarUrl,
    totalResolved: s.totalResolved, avgRating: s.avgRating,
    streakDays: s.streakDays, badges: s.badges,
  })
}
