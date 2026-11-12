import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarNivelAdminSchema } from '@/lib/validations'

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
    const result = actualizarNivelAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })
    }

    const level = await db.nivel.update({
      where: { id },
      data: {
        ...(result.data.nombre !== undefined ? { nombre: result.data.nombre } : {}),
        ...(result.data.orden !== undefined ? { orden: result.data.orden } : {}),
        ...(result.data.descripcion !== undefined ? { descripcion: result.data.descripcion || null } : {}),
        ...(result.data.activo !== undefined ? { activo: result.data.activo } : {}),
      },
      select: { id: true },
    })

    return NextResponse.json({ id: level.id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return NextResponse.json({ error: 'Ya existe un nivel con este nombre.' }, { status: 409 })
      if (error.code === 'P2025') return NextResponse.json({ error: 'Nivel no encontrado.' }, { status: 404 })
    }
    console.error('Error al actualizar nivel:', error)
    return NextResponse.json({ error: 'No fue posible actualizar el nivel.' }, { status: 500 })
  }
}
