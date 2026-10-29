import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { ModuleHeader } from '@/components/admin/module-header'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { AdminListColumn, AdminListRow } from '@/types/admin'

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
  const planes = await db.planEstudios.findMany({
    include: { _count: { select: { objetivos: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  const rows: AdminListRow[] = planes.map((plan) => ({
    id: plan.id,
    label: plan.nombre,
    cells: {
      nombre: plan.nombre,
      version: plan.version,
      niveles: 'Por definir',
      objetivos: String(plan._count.objetivos),
      estado: plan.activo ? 'Activo' : 'Inactivo',
      actualizacion: formatDate(plan.updatedAt),
    },
  }))

  return (
    <div>
      <ModuleHeader title="Planes de estudio" description="Administra versiones del currículo y sus objetivos pedagógicos." count={rows.length} />
      <AdminEntityList columns={columns} rows={rows} emptyMessage="No hay planes de estudio" searchPlaceholder="Buscar plan de estudio..." />
    </div>
  )
}
