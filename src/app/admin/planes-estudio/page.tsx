import { ModuleHeader } from '@/components/admin/module-header'
import { StudyPlanManagement } from '@/components/admin/study-plan-management'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { AdminLevelFormData, AdminListColumn, AdminListRow, AdminStudyPlanFormData } from '@/types/admin'

export const dynamic = 'force-dynamic'

const columns: AdminListColumn[] = [
  { key: 'nombre', label: 'Nombre', tablet: true, mobile: true },
  { key: 'version', label: 'Versión', tablet: true, mobile: true },
  { key: 'niveles', label: 'Niveles', tablet: true },
  { key: 'objetivos', label: 'Cantidad de objetivos' },
  { key: 'estado', label: 'Estado', tablet: true, mobile: true },
  { key: 'actualizacion', label: 'Fecha de actualización', tablet: true, mobile: true },
]

export default async function PlanesEstudioPage() {
  const [planes, niveles] = await Promise.all([
    db.planEstudios.findMany({
      include: {
        niveles: { select: { id: true, nombre: true } },
        objetivos: { where: { activo: true }, orderBy: { orden: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    db.nivel.findMany({ orderBy: { orden: 'asc' }, select: { id: true, nombre: true, orden: true, descripcion: true, activo: true } }),
  ])

  const rows: AdminListRow[] = planes.map((plan) => ({
    id: plan.id,
    label: plan.nombre,
    cells: {
      nombre: plan.nombre,
      version: plan.version,
      niveles: plan.niveles.map((nivel) => nivel.nombre).join(', ') || 'Sin niveles',
      objetivos: String(plan.objetivos.length),
      estado: plan.estado,
      actualizacion: formatDate(plan.updatedAt),
    },
  }))

  const planData: AdminStudyPlanFormData[] = planes.map((plan) => ({
    id: plan.id,
    nombre: plan.nombre,
    version: plan.version,
    estado: plan.estado,
    nivelIds: plan.niveles.map((nivel) => nivel.id),
    objetivos: plan.objetivos.map((objetivo) => ({
      id: objetivo.id,
      unidad: objetivo.unidad,
      descripcion: objetivo.descripcion,
      criteriosLogro: objetivo.criteriosLogro || '',
      orden: objetivo.orden,
    })),
    actualizacion: formatDate(plan.updatedAt),
  }))

  const levelData: AdminLevelFormData[] = niveles.map((nivel) => ({
    id: nivel.id,
    nombre: nivel.nombre,
    orden: nivel.orden,
    descripcion: nivel.descripcion || '',
    activo: nivel.activo,
  }))

  return (
    <div>
      <ModuleHeader title="Planes de estudio" description="Administra versiones del currículo y sus objetivos pedagógicos." count={rows.length} />
      <StudyPlanManagement columns={columns} rows={rows} plans={planData} levels={levelData} />
    </div>
  )
}
