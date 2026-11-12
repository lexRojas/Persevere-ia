import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { crearPiezaMusicalAdminSchema } from '@/lib/validations'

export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })

  try {
    const body: unknown = await request.json()
    const result = crearPiezaMusicalAdminSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })

    const piece = await db.piezaMusical.create({
      data: {
        nombre: result.data.nombre,
        nivel: result.data.nivel || null,
        notas: result.data.notas || null,
        activo: result.data.activo,
      },
      select: { id: true },
    })
    return NextResponse.json({ id: piece.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una pieza con este nombre.' }, { status: 409 })
    }
    console.error('Error al crear pieza musical:', error)
    return NextResponse.json({ error: 'No fue posible crear la pieza musical.' }, { status: 500 })
  }
}
