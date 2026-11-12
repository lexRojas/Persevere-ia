import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarClaseAdminSchema } from '@/lib/validations'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })

  try {
    const { id } = await context.params
    const body: unknown = await request.json()
    const result = actualizarClaseAdminSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })

    const current = await db.clase.findUnique({ where: { id }, include: { bitacora: true } })
    if (!current) return NextResponse.json({ error: 'Clase no encontrada.' }, { status: 404 })
    const data = result.data

    if (data.bitacora === null && current.bitacora) {
      return NextResponse.json({ error: 'La bitácora no puede eliminarse porque forma parte del historial.' }, { status: 400 })
    }
    if (data.estudianteId && data.estudianteId !== current.estudianteId) {
      const exists = await db.estudiante.count({ where: { id: data.estudianteId, estado: 'ACTIVO' } })
      if (!exists) return NextResponse.json({ error: 'El estudiante no existe o no está activo.' }, { status: 400 })
    }
    if (data.docenteId && data.docenteId !== current.docenteId) {
      const exists = await db.docente.count({ where: { id: data.docenteId, estado: 'ACTIVO' } })
      if (!exists) return NextResponse.json({ error: 'El profesor no existe o no está activo.' }, { status: 400 })
    }

    await db.$transaction(async (tx) => {
      const classData: Prisma.ClaseUpdateInput = {}
      if (data.estudianteId !== undefined) classData.estudiante = { connect: { id: data.estudianteId } }
      if (data.docenteId !== undefined) classData.docente = { connect: { id: data.docenteId } }
      if (data.fecha !== undefined) classData.fecha = data.fecha
      if (data.duracion !== undefined) classData.duracion = data.duracion
      if (data.nivel !== undefined) classData.nivel = data.nivel || null
      if (data.piezasTrabajadas !== undefined) classData.piezasTrabajadas = data.piezasTrabajadas || null
      if (data.estado !== undefined) classData.estado = data.estado
      await tx.clase.update({ where: { id }, data: classData })

      if (data.bitacora) {
        const journalFields = {
          objetivosSesion: data.bitacora.objetivosSesion || null,
          logrosObservados: data.bitacora.logrosObservados || null,
          dificultades: data.bitacora.dificultades || null,
          aspectosRecurrentes: data.bitacora.aspectosRecurrentes || null,
          trabajoCasa: data.bitacora.trabajoCasa || null,
          notaPrivada: data.bitacora.notaPrivada || null,
          revisionPublicacion: data.bitacora.revisionPublicacion || null,
          estado: data.bitacora.estado,
        }

        if (current.bitacora) {
          const updated = await tx.bitacoraClase.update({
            where: { id: current.bitacora.id },
            data: { ...journalFields, version: { increment: 1 } },
          })
          await tx.bitacoraRevision.create({
            data: { ...journalFields, bitacoraId: updated.id, version: updated.version, editadoPorId: session.user.id },
          })
        } else {
          await tx.bitacoraClase.create({
            data: {
              ...journalFields,
              claseId: id,
              revisiones: { create: { ...journalFields, version: 1, editadoPorId: session.user.id } },
            },
          })
        }
      }
    })

    return NextResponse.json({ id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Uno de los registros ya no existe.' }, { status: 400 })
    }
    console.error('Error al actualizar clase:', error)
    return NextResponse.json({ error: 'No fue posible actualizar la clase.' }, { status: 500 })
  }
}
