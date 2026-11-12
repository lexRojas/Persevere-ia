import { hash } from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { actualizarProfesorAdminSchema } from '@/lib/validations'

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
    const result = actualizarProfesorAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      )
    }

    const teacher = await db.docente.findUnique({
      where: { id },
      select: { usuarioId: true },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Profesor no encontrado.' }, { status: 404 })
    }

    const userData: Prisma.UserUpdateInput = {}
    const teacherData: Prisma.DocenteUpdateInput = {}

    if (result.data.nombre !== undefined) userData.name = result.data.nombre
    if (result.data.email !== undefined) userData.email = result.data.email.toLowerCase()
    if (result.data.password) userData.password = await hash(result.data.password, 12)
    if (result.data.especialidad !== undefined) teacherData.especialidad = result.data.especialidad
    if (result.data.estado !== undefined) teacherData.estado = result.data.estado

    await db.$transaction([
      db.user.update({ where: { id: teacher.usuarioId }, data: userData }),
      db.docente.update({ where: { id }, data: teacherData }),
    ])

    return NextResponse.json({ id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo.' }, { status: 409 })
    }

    console.error('Error al actualizar profesor:', error)
    return NextResponse.json({ error: 'No fue posible actualizar el profesor.' }, { status: 500 })
  }
}
