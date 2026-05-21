import { db } from '@/lib/db'
import { verifyStaff, unauthorized, badRequest } from '@/lib/server-auth'

// Normalize phone: strip everything except digits, keep last 10
function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits
}

export async function POST(request) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const { roomId, guestName, phone, checkOutDate } = await request.json()

  if (!roomId) return badRequest('Room is required')
  if (!guestName?.trim()) return badRequest('Guest name is required')
  if (!phone?.trim()) return badRequest('Phone number is required')
  if (!checkOutDate) return badRequest('Check-out date is required')

  const normalizedPhone = normalizePhone(phone)
  if (normalizedPhone.length < 10) return badRequest('Enter a valid 10-digit phone number')

  // Verify room exists and is active
  const room = await db.room.findUnique({ where: { id: roomId } })
  if (!room || !room.isActive) return badRequest('Room not found or inactive')

  // Check room has no active reservation already
  const existing = await db.reservation.findFirst({
    where: { roomId, status: 'active' },
  })
  if (existing) return badRequest('Room already has an active guest. Check out first.')

  // Find or create guest by phone
  let guest = await db.guest.findFirst({ where: { phone: normalizedPhone } })
  if (!guest) {
    guest = await db.guest.create({
      data: { name: guestName.trim(), phone: normalizedPhone },
    })
  } else {
    // Update name in case it changed
    guest = await db.guest.update({
      where: { id: guest.id },
      data: { name: guestName.trim() },
    })
  }

  const now = new Date()
  const checkOut = new Date(checkOutDate)
  checkOut.setHours(12, 0, 0, 0) // Standard checkout at noon

  const reservation = await db.reservation.create({
    data: {
      roomId,
      guestId: guest.id,
      checkInDate: now,
      checkOutDate: checkOut,
      checkedInAt: now,
      status: 'active',
    },
    include: {
      guest: { select: { name: true, phone: true } },
      room: { select: { roomNumber: true } },
    },
  })

  return Response.json(reservation, { status: 201 })
}
