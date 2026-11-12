import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarPlanEstudiosAdminSchema } from '@/lib/validations'

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
    const result = actualizarPlanEstudiosAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      )
    }

    const currentPlan = await db.planEstudios.findUnique({
      where: { id },
      select: {
        id: true,
        niveles: { select: { id: true } },
        objetivos: { select: { id: true } },
      },
    })

    if (!currentPlan) {
      return NextResponse.json({ error: 'Plan de estudio no encontrado.' }, { status: 404 })
    }

    const currentObjectiveIds = new Set(currentPlan.objetivos.map((objetivo) => objetivo.id))
    const requestedObjectiveIds = result.data.objetivos?.flatMap((objetivo) => objetivo.id ? [objetivo.id] : []) ?? []
    if (requestedObjectiveIds.some((objectiveId) => !currentObjectiveIds.has(objectiveId))) {
      return NextResponse.json({ error: 'Uno de los objetivos no pertenece a este plan.' }, { status: 400 })
    }

    if (result.data.nivelIds && result.data.nivelIds.length > 0) {
      const currentLevelIds = currentPlan.niveles.map((level) => level.id)
      const allowedLevelCount = await db.nivel.count({
        where: {
          id: { in: result.data.nivelIds },
          OR: [{ activo: true }, { id: { in: currentLevelIds } }],
        },
      })
      if (allowedLevelCount !== result.data.nivelIds.length) {
        return NextResponse.json({ error: 'Uno de los niveles no existe o está archivado.' }, { status: 400 })
      }
    }

    await db.$transaction(async (tx) => {
      const planData: Prisma.PlanEstudiosUpdateInput = {}
      if (result.data.nombre !== undefined) planData.nombre = result.data.nombre
      if (result.data.version !== undefined) planData.version = result.data.version
      if (result.data.estado !== undefined) planData.estado = result.data.estado
      if (result.data.nivelIds !== undefined) {
        planData.niveles = { set: result.data.nivelIds.map((levelId) => ({ id: levelId })) }
      }

      await tx.planEstudios.update({ where: { id }, data: planData })

      if (result.data.objetivos !== undefined) {
        await tx.objetivo.updateMany({
          where: {
            planEstudiosId: id,
            ...(requestedObjectiveIds.length > 0 ? { id: { notIn: requestedObjectiveIds } } : {}),
          },
          data: { activo: false },
        })

        for (const objetivo of result.data.objetivos) {
          const objectiveData = {
            unidad: objetivo.unidad,
            descripcion: objetivo.descripcion,
            criteriosLogro: objetivo.criteriosLogro || null,
            orden: objetivo.orden,
            activo: true,
          }

          if (objetivo.id) {
            await tx.objetivo.update({ where: { id: objetivo.id }, data: objectiveData })
          } else {
            await tx.objetivo.create({ data: { ...objectiveData, planEstudiosId: id } })
          }
        }
      }
    })

    return NextResponse.json({ id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ya existe un plan con este nombre y versión.' }, { status: 409 })
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Uno de los niveles u objetivos ya no existe.' }, { status: 400 })
      }
    }

    console.error('Error al actualizar plan de estudio:', error)
    return NextResponse.json({ error: 'No fue posible actualizar el plan de estudio.' }, { status: 500 })
  }
}
