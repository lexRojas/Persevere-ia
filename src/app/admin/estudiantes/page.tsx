import { ObjetivoEstado } from '@prisma/client'
import { ModuleHeader } from '@/components/admin/module-header'
import { StudentManagement } from '@/components/admin/student-management'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { AdminListColumn, AdminListRow, AdminStudentFormData } from '@/types/admin'

export const dynamic = 'force-dynamic'

const columns: AdminListColumn[] = [
  { key: 'nombre', label: 'Nombre', tablet: true, mobile: true },
  { key: 'nivel', label: 'Nivel', tablet: true, mobile: true },
  { key: 'estado', label: 'Estado', tablet: true, mobile: true },
  { key: 'objetivos', label: 'Objetivos actuales', tablet: true },
  { key: 'ultimaClase', label: 'Última clase' },
  { key: 'ultimaPractica', label: 'Última práctica' },
  { key: 'ensamble', label: 'Ensamble' },
]

export default async function EstudiantesPage() {
  const [estudiantes, niveles] = await Promise.all([
    db.estudiante.findMany({ include: {
      usuario: true,
      nivel: true,
      objetivos: {
        where: { estado: ObjetivoEstado.EN_PROCESO },
        include: { objetivo: true },
        orderBy: { fecha: 'desc' },
      },
      clases: { where: { fecha: { lte: new Date() } }, orderBy: { fecha: 'desc' }, take: 1 },
      practicas: { orderBy: { fecha: 'desc' }, take: 1 },
      ensambles: { include: { ensamble: true } },
    } }),
    db.nivel.findMany({ orderBy: { orden: 'asc' }, select: { id: true, nombre: true } }),
  ])

  const rows: AdminListRow[] = estudiantes
    .map((estudiante) => {
      const [primerObjetivo, ...objetivosAdicionales] = estudiante.objetivos
      const objetivos = primerObjetivo
        ? `${primerObjetivo.objetivo.descripcion}${objetivosAdicionales.length ? ` +${objetivosAdicionales.length}` : ''}`
        : 'Sin objetivos en proceso'

      return {
        id: estudiante.id,
        label: estudiante.usuario.name || estudiante.usuario.email || 'Estudiante sin nombre',
        cells: {
          nombre: estudiante.usuario.name || estudiante.usuario.email || 'Sin nombre',
          nivel: estudiante.nivel?.nombre || 'Sin nivel',
          estado: estudiante.estado,
          objetivos,
          ultimaClase: estudiante.clases[0] ? formatDate(estudiante.clases[0].fecha) : 'Sin clases',
          ultimaPractica: estudiante.practicas[0] ? formatDate(estudiante.practicas[0].fecha) : 'Sin práctica',
          ensamble: estudiante.ensambles.map(({ ensamble }) => ensamble.nombre).join(', ') || 'Sin ensamble',
        },
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))

  const students: AdminStudentFormData[] = estudiantes.map((estudiante) => ({
    id: estudiante.id,
    nombre: estudiante.usuario.name || '',
    email: estudiante.usuario.email || '',
    nivelId: estudiante.nivelId,
    fechaIngreso: estudiante.fechaIngreso.toISOString().slice(0, 10),
    estado: estudiante.estado as AdminStudentFormData['estado'],
  }))

  return (
    <div>
      <ModuleHeader title="Estudiantes" description="Consulta el estado académico, objetivos y actividad reciente." count={rows.length} />
      <StudentManagement columns={columns} rows={rows} students={students} levels={niveles} />
    </div>
  )
}
