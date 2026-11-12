import { hash } from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarRepresentanteAdminSchema } from '@/lib/validations'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  try {
    const { id } = await context.params
    const body: unknown = await request.json()
    const result = actualizarRepresentanteAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      )
    }

    const representante = await db.representante.findUnique({
      where: { id },
      select: { usuarioId: true },
    })

    if (!representante) {
      return NextResponse.json({ error: 'Representante no encontrado.' }, { status: 404 })
    }

    const userData: Prisma.UserUpdateInput = {}
    const repData: Prisma.RepresentanteUpdateInput = {}

    if (result.data.nombre !== undefined) userData.name = result.data.nombre
    if (result.data.email !== undefined) userData.email = result.data.email.toLowerCase()
    if (result.data.password) userData.password = await hash(result.data.password, 12)
    if (result.data.telefono !== undefined) repData.telefono = result.data.telefono || null
    if (result.data.relacion !== undefined) repData.relacion = result.data.relacion || null
    if (result.data.direccion !== undefined) repData.direccion = result.data.direccion || null
    if (result.data.estado !== undefined) repData.estado = result.data.estado

    await db.$transaction([
      db.user.update({ where: { id: representante.usuarioId }, data: userData }),
      db.representante.update({ where: { id }, data: repData }),
    ])

    return NextResponse.json({ id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo.' }, { status: 409 })
    }

    console.error('Error al actualizar representante:', error)
    return NextResponse.json({ error: 'No fue posible actualizar el representante.' }, { status: 500 })
  }
}
