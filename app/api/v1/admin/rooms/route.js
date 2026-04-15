import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden, badRequest } from '@/lib/server-auth'

export async function GET(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const rooms = await db.room.findMany({
    include: { _count: { select: { tickets: true } } },
    orderBy: { roomNumber: 'asc' },
  })
  return Response.json(rooms)
}

export async function POST(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()

  const { roomNumber, floor, roomType } = await request.json()
  if (!roomNumber) return badRequest('Room number required')

  const qrToken = nanoid(8)
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  const qrUrl = `${frontendUrl}/room/${qrToken}`

  const room = await db.room.create({ data: { roomNumber, floor, roomType, qrToken, qrUrl } })
  return Response.json(room, { status: 201 })
}
