import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  const all = await db.slaSettings.findMany()
  return Response.json(all)
}

export async function PATCH(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()

  const body = await request.json()
  const categories = ['room_service', 'housekeeping', 'maintenance', 'front_desk', 'emergency']
  await Promise.all(
    categories
      .filter((cat) => body[cat] !== undefined)
      .map((cat) =>
        db.slaSettings.upsert({
          where: { category: cat },
          update: { slaMinutes: Number(body[cat]) },
          create: { category: cat, slaMinutes: Number(body[cat]) },
        })
      )
  )
  const all = await db.slaSettings.findMany()
  return Response.json(all)
}
