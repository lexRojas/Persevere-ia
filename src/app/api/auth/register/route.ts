import { hash } from 'bcryptjs'
import { Prisma, Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registroSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const result = registroSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 },
      )
    }

    const { name, password, role } = result.data
    const email = result.data.email.trim().toLowerCase()

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este correo electrónico.' },
        { status: 409 },
      )
    }

    // Solo la primera cuenta docente puede crearse públicamente para
    // inicializar la academia. Las siguientes deben ser creadas por un admin.
    if (role === Role.TEACHER) {
      const teacherCount = await db.user.count({
        where: { role: { in: [Role.TEACHER, Role.ADMIN] } },
      })

      if (teacherCount > 0) {
        return NextResponse.json(
          { error: 'Las cuentas docentes adicionales deben ser creadas por la administración.' },
          { status: 403 },
        )
      }
    }

    const passwordHash = await hash(password, 12)

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email,
        password: passwordHash,
        role,
        ...(role === Role.STUDENT && { estudiante: { create: {} } }),
        ...(role === Role.TEACHER && { docente: { create: {} } }),
        ...(role === Role.REPRESENTATIVE && { representante: { create: {} } }),
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este correo electrónico.' },
        { status: 409 },
      )
    }

    console.error('Error al registrar usuario:', error)
    return NextResponse.json(
      { error: 'No fue posible crear la cuenta. Inténtalo nuevamente.' },
      { status: 500 },
    )
  }
}
