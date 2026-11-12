import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { crearEnsambleAdminSchema } from '@/lib/validations'

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  try {
    const body: unknown = await request.json()
    const result = crearEnsambleAdminSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })
    }

    const data = result.data
    const [teacherCount, studentCount, pieceCount] = await Promise.all([
      db.docente.count({ where: { id: { in: data.docenteIds }, estado: 'ACTIVO' } }),
      db.estudiante.count({ where: { id: { in: data.integrantes.map((item) => item.estudianteId) }, estado: 'ACTIVO' } }),
      db.piezaMusical.count({ where: { id: { in: data.piezas.map((item) => item.piezaMusicalId) }, activo: true } }),
    ])

    if (teacherCount !== data.docenteIds.length) {
      return NextResponse.json({ error: 'Uno de los profesores no existe o no está activo.' }, { status: 400 })
    }
    if (studentCount !== data.integrantes.length) {
      return NextResponse.json({ error: 'Uno de los estudiantes no existe o no está activo.' }, { status: 400 })
    }
    if (pieceCount !== data.piezas.length) {
      return NextResponse.json({ error: 'Una de las piezas no existe o está archivada.' }, { status: 400 })
    }

    const ensemble = await db.ensamble.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        notasCompartidas: data.notasCompartidas || null,
        estado: data.estado,
        docentes: { create: data.docenteIds.map((docenteId) => ({ docenteId })) },
        integrantes: {
          create: data.integrantes.map((item) => ({ estudianteId: item.estudianteId, rol: item.rol || null })),
        },
        piezas: {
          create: data.piezas.map((item) => ({ piezaMusicalId: item.piezaMusicalId, objetivoColectivo: item.objetivoColectivo || null })),
        },
        ensayos: {
          create: data.ensayos.map((item) => ({
            fecha: item.fecha,
            duracion: item.duracion ?? null,
            estado: item.estado,
            notas: item.notas || null,
          })),
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ id: ensemble.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un ensamble con este nombre.' }, { status: 409 })
    }
    console.error('Error al crear ensamble:', error)
    return NextResponse.json({ error: 'No fue posible crear el ensamble.' }, { status: 500 })
  }
}
