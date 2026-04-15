import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { badRequest } from '@/lib/server-auth'

export async function POST(request) {
  const { email, password } = await request.json()
  if (!email || !password) return badRequest('Email and password required')

  const staff = await db.staff.findUnique({ where: { email: email.toLowerCase() } })
  if (!staff || !staff.isActive) return Response.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, staff.passwordHash)
  if (!valid) return Response.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = jwt.sign({ staffId: staff.id, role: staff.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '8h',
  })

  return Response.json({
    token,
    staff: {
      id: staff.id, name: staff.name, email: staff.email,
      role: staff.role, department: staff.department, avatarUrl: staff.avatarUrl,
    },
  })
}
