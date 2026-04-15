import { verifyRoom, unauthorized } from '@/lib/server-auth'

export async function POST(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')
  const { enabled } = await request.json()
  return Response.json({ success: true, dnd: !!enabled })
}
