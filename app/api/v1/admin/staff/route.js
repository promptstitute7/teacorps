import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden, badRequest } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const staffList = await db.staff.findMany({
    select: {
      id: true, name: true, email: true, role: true, department: true,
      isActive: true, avatarUrl: true, totalResolved: true, avgRating: true,
      streakDays: true, badges: true, createdAt: true,
    },
    orderBy: { name: 'asc' },
  })
  return Response.json(staffList)
}

export async function POST(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()

  const { name, email, password, role, department, phone } = await request.json()
  if (!name || !email || !password || !role) return badRequest('Name, email, password, and role are required')

  const existing = await db.staff.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return Response.json({ error: 'Email already in use' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const created = await db.staff.create({
    data: { name, email: email.toLowerCase(), passwordHash, role, department, phone },
    select: { id: true, name: true, email: true, role: true, department: true, createdAt: true },
  })
  return Response.json(created, { status: 201 })
}
