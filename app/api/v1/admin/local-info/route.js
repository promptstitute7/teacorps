import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  const entries = await db.localInfo.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] })
  return Response.json(entries)
}

export async function POST(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()
  const body = await request.json()
  const entry = await db.localInfo.create({ data: body })
  return Response.json(entry, { status: 201 })
}
