import { hash } from 'bcryptjs'
import { Prisma, Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { crearRepresentanteAdminSchema } from '@/lib/validations'

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  try {
    const body: unknown = await request.json()
    const result = crearRepresentanteAdminSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      )
    }

    const { nombre, telefono, relacion, direccion, estado, password } = result.data
    const email = result.data.email.toLowerCase()
    const passwordHash = await hash(password, 12)

    const representante = await db.user.create({
      data: {
        name: nombre,
        email,
        password: passwordHash,
        role: Role.REPRESENTATIVE,
        representante: {
          create: {
            nombre,
            telefono: telefono || null,
            relacion: relacion || null,
            direccion: direccion || null,
            estado,
          },
        },
      },
      select: { representante: { select: { id: true } } },
    })

    return NextResponse.json({ id: representante.representante?.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo.' }, { status: 409 })
    }

    console.error('Error al crear representante:', error)
    return NextResponse.json({ error: 'No fue posible crear el representante.' }, { status: 500 })
  }
}
