import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { ModuleHeader } from '@/components/admin/module-header'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { AdminListColumn, AdminListRow } from '@/types/admin'

export const dynamic = 'force-dynamic'

const columns: AdminListColumn[] = [
  { key: 'nombre', label: 'Nombre', tablet: true, mobile: true },
  { key: 'especialidad', label: 'Especialidad', tablet: true, mobile: true },
  { key: 'estado', label: 'Estado', tablet: true, mobile: true },
  { key: 'estudiantes', label: 'Cantidad de estudiantes', tablet: true },
  { key: 'proximaClase', label: 'Próxima clase' },
  { key: 'ultimoAcceso', label: 'Último acceso' },
]

export default async function ProfesoresPage() {
  const now = new Date()
  const profesores = await db.docente.findMany({
    include: {
      usuario: true,
      clases: {
        select: { estudianteId: true, fecha: true },
        orderBy: { fecha: 'asc' },
      },
    },
  })

  const rows: AdminListRow[] = profesores
    .map((profesor) => {
      const estudiantes = new Set(profesor.clases.map((clase) => clase.estudianteId)).size
      const proximaClase = profesor.clases.find((clase) => clase.fecha >= now)

      return {
        id: profesor.id,
        label: profesor.usuario.name || profesor.usuario.email || 'Profesor sin nombre',
        cells: {
          nombre: profesor.usuario.name || profesor.usuario.email || 'Sin nombre',
          especialidad: profesor.especialidad || 'Por definir',
          estado: 'Por definir',
          estudiantes: String(estudiantes),
          proximaClase: proximaClase ? formatDate(proximaClase.fecha) : 'Sin clase programada',
          ultimoAcceso: 'Por definir',
        },
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))

  return (
    <div>
      <ModuleHeader title="Profesores" description="Consulta perfiles, estudiantes relacionados y agenda académica." count={rows.length} />
      <AdminEntityList columns={columns} rows={rows} emptyMessage="No hay profesores registrados" searchPlaceholder="Buscar profesor..." />
    </div>
  )
}
