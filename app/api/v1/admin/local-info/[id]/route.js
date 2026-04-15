import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden } from '@/lib/server-auth'

export async function PATCH(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()
  const body = await request.json()
  const entry = await db.localInfo.update({ where: { id: params.id }, data: body })
  return Response.json(entry)
}

export async function DELETE(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()
  await db.localInfo.delete({ where: { id: params.id } })
  return Response.json({ success: true })
}
