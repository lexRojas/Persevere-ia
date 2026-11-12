import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { crearClaseAdminSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })

  try {
    const body: unknown = await request.json()
    const result = crearClaseAdminSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })

    const data = result.data
    const [student, teacher] = await Promise.all([
      db.estudiante.findFirst({ where: { id: data.estudianteId, estado: 'ACTIVO' }, include: { nivel: true } }),
      db.docente.findFirst({ where: { id: data.docenteId, estado: 'ACTIVO' }, select: { id: true } }),
    ])
    if (!student) return NextResponse.json({ error: 'El estudiante no existe o no está activo.' }, { status: 400 })
    if (!teacher) return NextResponse.json({ error: 'El profesor no existe o no está activo.' }, { status: 400 })

    const journal = data.bitacora
    const journalFields = journal ? {
      objetivosSesion: journal.objetivosSesion || null,
      logrosObservados: journal.logrosObservados || null,
      dificultades: journal.dificultades || null,
      aspectosRecurrentes: journal.aspectosRecurrentes || null,
      trabajoCasa: journal.trabajoCasa || null,
      notaPrivada: journal.notaPrivada || null,
      revisionPublicacion: journal.revisionPublicacion || null,
      estado: journal.estado,
    } : null

    const classRecord = await db.clase.create({
      data: {
        estudianteId: data.estudianteId,
        docenteId: data.docenteId,
        fecha: data.fecha,
        duracion: data.duracion ?? null,
        nivel: data.nivel || student.nivel?.nombre || null,
        piezasTrabajadas: data.piezasTrabajadas || null,
        estado: data.estado,
        ...(journalFields ? {
          bitacora: {
            create: {
              ...journalFields,
              revisiones: {
                create: { ...journalFields, version: 1, editadoPorId: session.user.id },
              },
            },
          },
        } : {}),
      },
      select: { id: true },
    })

    return NextResponse.json({ id: classRecord.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'El profesor o estudiante ya no existe.' }, { status: 400 })
    }
    console.error('Error al crear clase:', error)
    return NextResponse.json({ error: 'No fue posible crear la clase.' }, { status: 500 })
  }
}
