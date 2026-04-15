import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden, notFound } from '@/lib/server-auth'

export async function POST(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()

  const room = await db.room.findUnique({ where: { id: params.id } })
  if (!room) return notFound('Room not found')

  const qrToken = nanoid(8)
  const frontendUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000')
  const qrUrl = `${frontendUrl}/room/${qrToken}`

  const updated = await db.room.update({ where: { id: room.id }, data: { qrToken, qrUrl } })
  return Response.json(updated)
}
