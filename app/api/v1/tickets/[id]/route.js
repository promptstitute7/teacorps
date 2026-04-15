import { db } from '@/lib/db'
import { notFound } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      room: true,
      events: { orderBy: { createdAt: 'asc' } },
      assignedStaff: { select: { name: true, department: true } },
    },
  })
  if (!ticket) return notFound('Ticket not found')
  return Response.json(ticket)
}
