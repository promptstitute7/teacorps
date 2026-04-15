import QRCode from 'qrcode'
import { db } from '@/lib/db'
import { notFound } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const room = await db.room.findUnique({ where: { id: params.id } })
  if (!room) return notFound('Room not found')

  const qrUrl = room.qrUrl || `http://localhost:3000/room/${room.qrToken}`
  const buffer = await QRCode.toBuffer(qrUrl, { width: 500, margin: 2, color: { dark: '#1b1c19', light: '#fbf9f4' } })

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="room-${room.roomNumber}-qr.png"`,
    },
  })
}
