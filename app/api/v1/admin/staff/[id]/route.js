import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { verifyStaff, unauthorized, forbidden } from '@/lib/server-auth'

export async function PATCH(request, { params }) {
  const staff = await verifyStaff(request)
  if (!staff) return unauthorized()
  if (staff.role !== 'admin') return forbidden()

  const { name, role, department, isActive, phone, password } = await request.json()
  const updateData = {}
  if (name !== undefined) updateData.name = name
  if (role !== undefined) updateData.role = role
  if (department !== undefined) updateData.department = department
  if (isActive !== undefined) updateData.isActive = isActive
  if (phone !== undefined) updateData.phone = phone
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12)

  const updated = await db.staff.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, department: true, isActive: true },
  })
  return Response.json(updated)
}
