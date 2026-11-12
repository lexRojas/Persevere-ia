import { ModuleHeader } from '@/components/admin/module-header'
import { TeacherManagement } from '@/components/admin/teacher-management'
import { db } from '@/lib/db'
import { formatDateTime } from '@/lib/utils'
import type { AdminListColumn, AdminListRow, AdminTeacherFormData } from '@/types/admin'

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
        select: {
          estudianteId: true,
          fecha: true,
          estudiante: { select: { estado: true } },
        },
        orderBy: { fecha: 'asc' },
      },
    },
  })

  const rows: AdminListRow[] = profesores
    .map((profesor) => {
      const estudiantes = new Set(
        profesor.clases
          .filter((clase) => clase.estudiante.estado === 'ACTIVO')
          .map((clase) => clase.estudianteId),
      ).size
      const proximaClase = profesor.clases.find((clase) => clase.fecha >= now)

      return {
        id: profesor.id,
        label: profesor.usuario.name || profesor.usuario.email || 'Profesor sin nombre',
        cells: {
          nombre: profesor.usuario.name || profesor.usuario.email || 'Sin nombre',
          especialidad: profesor.especialidad || 'Por definir',
          estado: profesor.estado,
          estudiantes: String(estudiantes),
          proximaClase: proximaClase ? formatDateTime(proximaClase.fecha) : 'Sin clase programada',
          ultimoAcceso: profesor.usuario.lastLoginAt ? formatDateTime(profesor.usuario.lastLoginAt) : 'Sin accesos',
        },
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))

  const teachers: AdminTeacherFormData[] = profesores.map((profesor) => {
    const estudiantes = new Set(
      profesor.clases
        .filter((clase) => clase.estudiante.estado === 'ACTIVO')
        .map((clase) => clase.estudianteId),
    ).size
    const proximaClase = profesor.clases.find((clase) => clase.fecha >= now)

    return {
      id: profesor.id,
      nombre: profesor.usuario.name || '',
      email: profesor.usuario.email || '',
      especialidad: profesor.especialidad || '',
      estado: profesor.estado,
      estudiantes: String(estudiantes),
      proximaClase: proximaClase ? formatDateTime(proximaClase.fecha) : 'Sin clase programada',
      ultimoAcceso: profesor.usuario.lastLoginAt ? formatDateTime(profesor.usuario.lastLoginAt) : 'Sin accesos',
    }
  })

  return (
    <div>
      <ModuleHeader title="Profesores" description="Consulta perfiles, estudiantes relacionados y agenda académica." count={rows.length} />
      <TeacherManagement columns={columns} rows={rows} teachers={teachers} />
    </div>
  )
}
