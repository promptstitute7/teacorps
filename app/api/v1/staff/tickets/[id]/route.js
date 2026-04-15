import { db } from '@/lib/db'
import { verifyStaff, unauthorized, notFound } from '@/lib/server-auth'
import { sendTicketUpdate } from '@/lib/whatsapp'

export async function PATCH(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()

  const { status, assigned_to, note } = await request.json()
  const ticket = await db.ticket.findUnique({ where: { id: params.id } })
  if (!ticket) return notFound('Ticket not found')

  const updateData = { updatedAt: new Date() }
  const events = []

  if (status && status !== ticket.status) {
    updateData.status = status
    if (status === 'completed') {
      updateData.completedAt = new Date()
      if (ticket.assignedTo) {
        await db.staff.update({ where: { id: ticket.assignedTo }, data: { totalResolved: { increment: 1 } } })
      }
    }
    events.push({
      ticketId: ticket.id,
      eventType: status === 'acknowledged' && ticket.status === 'new' ? 'acknowledged' : 'status_changed',
      actorId: staff.id, actorType: 'staff',
      oldValue: ticket.status, newValue: status, note: note ?? null,
    })
  }

  if (assigned_to !== undefined && assigned_to !== ticket.assignedTo) {
    updateData.assignedTo = assigned_to ?? null
    events.push({
      ticketId: ticket.id, eventType: 'assigned',
      actorId: staff.id, actorType: 'staff',
      oldValue: ticket.assignedTo, newValue: assigned_to,
    })
  }

  if (note && !status) {
    events.push({ ticketId: ticket.id, eventType: 'status_changed', actorId: staff.id, actorType: 'staff', note })
  }

  const updated = await db.ticket.update({
    where: { id: ticket.id },
    data: updateData,
    include: {
      room: { select: { roomNumber: true } },
      assignedStaff: { select: { id: true, name: true } },
    },
  })

  if (events.length > 0) await db.ticketEvent.createMany({ data: events })

  // WhatsApp notification to guest on key status changes
  if (status && ['acknowledged', 'in_progress', 'completed'].includes(status)) {
    const guest = ticket.guestId ? await db.guest.findUnique({ where: { id: ticket.guestId } }) : null
    if (guest?.phone) {
      sendTicketUpdate({
        to: guest.phone,
        ticketNumber: ticket.ticketNumber,
        status,
        category: ticket.category,
      }).catch(() => {})
    }
  }

  return Response.json(updated)
}
