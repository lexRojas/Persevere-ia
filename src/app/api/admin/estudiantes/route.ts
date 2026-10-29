import { hash } from 'bcryptjs'
import { Prisma, Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { crearEstudianteAdminSchema } from '@/lib/validations'

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  try {
    const body: unknown = await request.json()
    const result = crearEstudianteAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      )
    }

    const { nombre, password, fechaIngreso, estado } = result.data
    const email = result.data.email.toLowerCase()
    const passwordHash = await hash(password, 12)

    const student = await db.user.create({
      data: {
        name: nombre,
        email,
        password: passwordHash,
        role: Role.STUDENT,
        estudiante: {
          create: {
            nivelId: result.data.nivelId || null,
            fechaIngreso: fechaIngreso ?? new Date(),
            estado,
          },
        },
      },
      select: {
        estudiante: { select: { id: true } },
      },
    })

    return NextResponse.json({ id: student.estudiante?.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo.' }, { status: 409 })
    }

    console.error('Error al crear estudiante:', error)
    return NextResponse.json({ error: 'No fue posible crear el estudiante.' }, { status: 500 })
  }
}
