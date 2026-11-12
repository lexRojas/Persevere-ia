import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarEnsambleAdminSchema } from '@/lib/validations'

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
    const result = actualizarEnsambleAdminSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })
    }

    const current = await db.ensamble.findUnique({
      where: { id },
      select: {
        id: true,
        docentes: { select: { docenteId: true } },
        integrantes: { select: { estudianteId: true } },
        piezas: { select: { piezaMusicalId: true } },
        ensayos: { select: { id: true } },
      },
    })
    if (!current) return NextResponse.json({ error: 'Ensamble no encontrado.' }, { status: 404 })

    const data = result.data
    const rehearsalIds = data.ensayos?.flatMap((item) => item.id ? [item.id] : []) ?? []
    const currentRehearsalIds = new Set(current.ensayos.map((item) => item.id))
    if (rehearsalIds.some((rehearsalId) => !currentRehearsalIds.has(rehearsalId))) {
      return NextResponse.json({ error: 'Uno de los ensayos no pertenece a este ensamble.' }, { status: 400 })
    }

    if (data.docenteIds) {
      const count = await db.docente.count({
        where: { id: { in: data.docenteIds }, OR: [{ estado: 'ACTIVO' }, { id: { in: current.docentes.map((item) => item.docenteId) } }] },
      })
      if (count !== data.docenteIds.length) return NextResponse.json({ error: 'Uno de los profesores no existe o no está activo.' }, { status: 400 })
    }
    if (data.integrantes) {
      const ids = data.integrantes.map((item) => item.estudianteId)
      const count = await db.estudiante.count({
        where: { id: { in: ids }, OR: [{ estado: 'ACTIVO' }, { id: { in: current.integrantes.map((item) => item.estudianteId) } }] },
      })
      if (count !== ids.length) return NextResponse.json({ error: 'Uno de los estudiantes no existe o no está activo.' }, { status: 400 })
    }
    if (data.piezas) {
      const ids = data.piezas.map((item) => item.piezaMusicalId)
      const count = await db.piezaMusical.count({
        where: { id: { in: ids }, OR: [{ activo: true }, { id: { in: current.piezas.map((item) => item.piezaMusicalId) } }] },
      })
      if (count !== ids.length) return NextResponse.json({ error: 'Una de las piezas no existe o está archivada.' }, { status: 400 })
    }

    await db.$transaction(async (tx) => {
      const baseData: Prisma.EnsambleUpdateInput = {}
      if (data.nombre !== undefined) baseData.nombre = data.nombre
      if (data.descripcion !== undefined) baseData.descripcion = data.descripcion || null
      if (data.notasCompartidas !== undefined) baseData.notasCompartidas = data.notasCompartidas || null
      if (data.estado !== undefined) baseData.estado = data.estado
      await tx.ensamble.update({ where: { id }, data: baseData })

      if (data.docenteIds) {
        await tx.ensambleDocente.updateMany({
          where: { ensambleId: id, ...(data.docenteIds.length ? { docenteId: { notIn: data.docenteIds } } : {}) },
          data: { activo: false, fechaRetiro: new Date() },
        })
        for (const docenteId of data.docenteIds) {
          await tx.ensambleDocente.upsert({
            where: { ensambleId_docenteId: { ensambleId: id, docenteId } },
            create: { ensambleId: id, docenteId },
            update: { activo: true, fechaRetiro: null },
          })
        }
      }

      if (data.integrantes) {
        const ids = data.integrantes.map((item) => item.estudianteId)
        await tx.ensambleIntegrante.updateMany({
          where: { ensambleId: id, ...(ids.length ? { estudianteId: { notIn: ids } } : {}) },
          data: { activo: false, fechaRetiro: new Date() },
        })
        for (const item of data.integrantes) {
          await tx.ensambleIntegrante.upsert({
            where: { ensambleId_estudianteId: { ensambleId: id, estudianteId: item.estudianteId } },
            create: { ensambleId: id, estudianteId: item.estudianteId, rol: item.rol || null },
            update: { activo: true, fechaRetiro: null, rol: item.rol || null },
          })
        }
      }

      if (data.piezas) {
        const ids = data.piezas.map((item) => item.piezaMusicalId)
        await tx.ensamblePieza.updateMany({
          where: { ensambleId: id, ...(ids.length ? { piezaMusicalId: { notIn: ids } } : {}) },
          data: { activo: false, fechaRetiro: new Date() },
        })
        for (const item of data.piezas) {
          await tx.ensamblePieza.upsert({
            where: { ensambleId_piezaMusicalId: { ensambleId: id, piezaMusicalId: item.piezaMusicalId } },
            create: { ensambleId: id, piezaMusicalId: item.piezaMusicalId, objetivoColectivo: item.objetivoColectivo || null },
            update: { activo: true, fechaRetiro: null, objetivoColectivo: item.objetivoColectivo || null },
          })
        }
      }

      if (data.ensayos) {
        await tx.ensayo.updateMany({
          where: { ensambleId: id, ...(rehearsalIds.length ? { id: { notIn: rehearsalIds } } : {}) },
          data: { estado: 'CANCELADO' },
        })
        for (const item of data.ensayos) {
          const rehearsalData = { fecha: item.fecha, duracion: item.duracion ?? null, estado: item.estado, notas: item.notas || null }
          if (item.id) await tx.ensayo.update({ where: { id: item.id }, data: rehearsalData })
          else await tx.ensayo.create({ data: { ...rehearsalData, ensambleId: id } })
        }
      }
    })

    return NextResponse.json({ id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return NextResponse.json({ error: 'Ya existe un ensamble con este nombre.' }, { status: 409 })
      if (error.code === 'P2025') return NextResponse.json({ error: 'Uno de los registros ya no existe.' }, { status: 400 })
    }
    console.error('Error al actualizar ensamble:', error)
    return NextResponse.json({ error: 'No fue posible actualizar el ensamble.' }, { status: 500 })
  }
}
