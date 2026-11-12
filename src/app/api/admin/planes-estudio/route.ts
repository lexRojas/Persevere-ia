import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { crearPlanEstudiosAdminSchema } from '@/lib/validations'

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  try {
    const body: unknown = await request.json()
    const result = crearPlanEstudiosAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      )
    }

    if (result.data.nivelIds.length > 0) {
      const activeLevelCount = await db.nivel.count({
        where: { id: { in: result.data.nivelIds }, activo: true },
      })
      if (activeLevelCount !== result.data.nivelIds.length) {
        return NextResponse.json({ error: 'Uno de los niveles no existe o está archivado.' }, { status: 400 })
      }
    }

    const plan = await db.planEstudios.create({
      data: {
        nombre: result.data.nombre,
        version: result.data.version,
        estado: result.data.estado,
        niveles: {
          connect: result.data.nivelIds.map((id) => ({ id })),
        },
        objetivos: {
          create: result.data.objetivos.map((objetivo) => ({
            unidad: objetivo.unidad,
            descripcion: objetivo.descripcion,
            criteriosLogro: objetivo.criteriosLogro || null,
            orden: objetivo.orden,
          })),
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ id: plan.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ya existe un plan con este nombre y versión.' }, { status: 409 })
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Uno de los niveles seleccionados no existe.' }, { status: 400 })
      }
    }

    console.error('Error al crear plan de estudio:', error)
    return NextResponse.json({ error: 'No fue posible crear el plan de estudio.' }, { status: 500 })
  }
}
