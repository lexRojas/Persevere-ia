import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarPiezaMusicalAdminSchema } from '@/lib/validations'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })

  try {
    const { id } = await context.params
    const body: unknown = await request.json()
    const result = actualizarPiezaMusicalAdminSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })

    const piece = await db.piezaMusical.update({
      where: { id },
      data: {
        ...(result.data.nombre !== undefined ? { nombre: result.data.nombre } : {}),
        ...(result.data.nivel !== undefined ? { nivel: result.data.nivel || null } : {}),
        ...(result.data.notas !== undefined ? { notas: result.data.notas || null } : {}),
        ...(result.data.activo !== undefined ? { activo: result.data.activo } : {}),
      },
      select: { id: true },
    })
    return NextResponse.json({ id: piece.id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return NextResponse.json({ error: 'Ya existe una pieza con este nombre.' }, { status: 409 })
      if (error.code === 'P2025') return NextResponse.json({ error: 'Pieza musical no encontrada.' }, { status: 404 })
    }
    console.error('Error al actualizar pieza musical:', error)
    return NextResponse.json({ error: 'No fue posible actualizar la pieza musical.' }, { status: 500 })
  }
}
