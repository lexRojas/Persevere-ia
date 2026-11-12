import { ModuleHeader } from '@/components/admin/module-header'
import { RepresentativeManagement } from '@/components/admin/representative-management'
import { db } from '@/lib/db'
import { formatDateTime } from '@/lib/utils'
import type { AdminListColumn, AdminListRow, AdminRepresentanteFormData } from '@/types/admin'

export const dynamic = 'force-dynamic'

const columns: AdminListColumn[] = [
  { key: 'nombre', label: 'Nombre', tablet: true, mobile: true },
  { key: 'email', label: 'Correo', tablet: true, mobile: true },
  { key: 'telefono', label: 'Teléfono', tablet: true },
  { key: 'relacion', label: 'Relación', tablet: true },
  { key: 'estado', label: 'Estado', tablet: true, mobile: true },
  { key: 'estudiantes', label: 'Estudiantes' },
  { key: 'ultimoAcceso', label: 'Último acceso' },
]

export default async function RepresentantesPage() {
  const representantes = await db.representante.findMany({
    include: {
      usuario: true,
      _count: { select: { estudiantes: true } },
    },
    orderBy: { nombre: 'asc' },
  })

  const rows: AdminListRow[] = representantes.map((rep) => ({
    id: rep.id,
    label: rep.nombre,
    cells: {
      nombre: rep.nombre,
      email: rep.usuario.email || 'Sin correo',
      telefono: rep.telefono || 'Sin teléfono',
      relacion: relLabel(rep.relacion),
      estado: rep.estado,
      estudiantes: String(rep._count.estudiantes),
      ultimoAcceso: rep.usuario.lastLoginAt ? formatDateTime(rep.usuario.lastLoginAt) : 'Sin accesos',
    },
  }))

  const repData: AdminRepresentanteFormData[] = representantes.map((rep) => ({
    id: rep.id,
    nombre: rep.nombre,
    email: rep.usuario.email || '',
    telefono: rep.telefono || '',
    relacion: rep.relacion || '',
    direccion: rep.direccion || '',
    estado: rep.estado as 'ACTIVO' | 'INACTIVO',
    estudiantes: String(rep._count.estudiantes),
    ultimoAcceso: rep.usuario.lastLoginAt ? formatDateTime(rep.usuario.lastLoginAt) : 'Sin accesos',
  }))

  return (
    <div>
      <ModuleHeader title="Representantes" description="Gestiona perfiles de representantes y su vinculación con estudiantes." count={rows.length} />
      <RepresentativeManagement columns={columns} rows={rows} representatives={repData} />
    </div>
  )
}

function relLabel(rel: string | null): string {
  if (!rel) return 'Sin especificar'
  const map: Record<string, string> = {
    PADRE: 'Padre',
    MADRE: 'Madre',
    TUTOR: 'Tutor',
    OTRO: 'Otro',
  }
  return map[rel] || rel
}
