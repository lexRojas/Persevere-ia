import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'

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
    const { estudianteIds }: { estudianteIds?: string[] } = body ?? {}

    if (!Array.isArray(estudianteIds)) {
      return NextResponse.json({ error: 'Se requiere una lista de IDs de estudiantes.' }, { status: 400 })
    }

    const representante = await db.representante.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!representante) {
      return NextResponse.json({ error: 'Representante no encontrado.' }, { status: 404 })
    }

    // Validar que los estudiantes existan y estén activos
    if (estudianteIds.length > 0) {
      const count = await db.estudiante.count({
        where: {
          id: { in: estudianteIds },
          estado: 'ACTIVO',
        },
      })
      if (count !== estudianteIds.length) {
        return NextResponse.json({ error: 'Uno de los estudiantes no existe o no está activo.' }, { status: 400 })
      }
    }

    // Desasignar estudiantes que ya no pertenecen a este representante
    await db.estudiante.updateMany({
      where: {
        representanteId: id,
        id: { notIn: estudianteIds },
      },
      data: { representanteId: null },
    })

    // Asignar los nuevos estudiantes a este representante
    await db.estudiante.updateMany({
      where: {
        id: { in: estudianteIds },
      },
      data: { representanteId: id },
    })

    const updated = await db.representante.findUnique({
      where: { id },
      include: {
        estudiantes: {
          where: { estado: 'ACTIVO' },
          select: {
            id: true,
            usuario: { select: { name: true, email: true } },
            estado: true,
          },
        },
        _count: { select: { estudiantes: true } },
      },
    })

    return NextResponse.json({
      id: updated?.id,
      estudianteCount: updated?._count.estudiantes ?? 0,
      estudiantes: updated?.estudiantes.map((e) => ({
        id: e.id,
        nombre: e.usuario.name || e.usuario.email || 'Sin nombre',
        email: e.usuario.email || '',
        estado: e.estado,
      })) ?? [],
    })
  } catch (error) {
    console.error('Error al asignar estudiantes al representante:', error)
    return NextResponse.json({ error: 'No fue posible actualizar los estudiantes del representante.' }, { status: 500 })
  }
}
