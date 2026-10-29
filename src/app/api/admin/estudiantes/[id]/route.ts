import { hash } from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarEstudianteAdminSchema } from '@/lib/validations'

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
    const result = actualizarEstudianteAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      )
    }

    const student = await db.estudiante.findUnique({
      where: { id },
      select: { usuarioId: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado.' }, { status: 404 })
    }

    const userData: Prisma.UserUpdateInput = {}
    const studentData: Prisma.EstudianteUpdateInput = {}

    if (result.data.nombre !== undefined) userData.name = result.data.nombre
    if (result.data.email !== undefined) userData.email = result.data.email.toLowerCase()
    if (result.data.password) userData.password = await hash(result.data.password, 12)
    if (result.data.nivelId !== undefined) {
      studentData.nivel = result.data.nivelId
        ? { connect: { id: result.data.nivelId } }
        : { disconnect: true }
    }
    if (result.data.fechaIngreso !== undefined) studentData.fechaIngreso = result.data.fechaIngreso
    if (result.data.estado !== undefined) studentData.estado = result.data.estado

    await db.$transaction([
      db.user.update({ where: { id: student.usuarioId }, data: userData }),
      db.estudiante.update({ where: { id }, data: studentData }),
    ])

    return NextResponse.json({ id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo.' }, { status: 409 })
    }

    console.error('Error al actualizar estudiante:', error)
    return NextResponse.json({ error: 'No fue posible actualizar el estudiante.' }, { status: 500 })
  }
}
