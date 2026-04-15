import jwt from 'jsonwebtoken'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET

export async function verifyStaff(request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const staff = await db.staff.findUnique({ where: { id: payload.staffId } })
    if (!staff?.isActive) return null
    return staff
  } catch {
    return null
  }
}

export async function verifyRoom(tokenOrRequest, paramToken) {
  const roomToken = typeof tokenOrRequest === 'string'
    ? tokenOrRequest
    : (tokenOrRequest.headers.get('x-room-token') || paramToken)
  if (!roomToken) return null
  const room = await db.room.findUnique({ where: { qrToken: roomToken } })
  if (!room?.isActive) return null
  return room
}

export function isManager(staff) {
  return ['manager', 'admin'].includes(staff?.role)
}

export function isAdmin(staff) {
  return staff?.role === 'admin'
}

export function unauthorized(msg = 'Unauthorized') {
  return Response.json({ error: msg }, { status: 401 })
}

export function forbidden(msg = 'Forbidden') {
  return Response.json({ error: msg }, { status: 403 })
}

export function notFound(msg = 'Not found') {
  return Response.json({ error: msg }, { status: 404 })
}

export function badRequest(msg) {
  return Response.json({ error: msg }, { status: 400 })
}
