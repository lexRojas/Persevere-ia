import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { ModuleHeader } from '@/components/admin/module-header'
import { db } from '@/lib/db'
import type { AdminListColumn, AdminListRow } from '@/types/admin'

export const dynamic = 'force-dynamic'

const columns: AdminListColumn[] = [
  { key: 'nombre', label: 'Nombre', tablet: true, mobile: true },
  { key: 'profesor', label: 'Profesor responsable', tablet: true, mobile: true },
  { key: 'integrantes', label: 'Integrantes', tablet: true },
  { key: 'repertorio', label: 'Repertorio activo' },
  { key: 'proximoEnsayo', label: 'Próximo ensayo' },
  { key: 'estado', label: 'Estado', tablet: true, mobile: true },
]

export default async function EnsamblesPage() {
  const ensambles = await db.ensamble.findMany({
    include: {
      _count: { select: { integrantes: true } },
      piezas: { include: { piezaMusical: true } },
    },
    orderBy: { nombre: 'asc' },
  })

  const rows: AdminListRow[] = ensambles.map((ensamble) => ({
    id: ensamble.id,
    label: ensamble.nombre,
    cells: {
      nombre: ensamble.nombre,
      profesor: 'Por definir',
      integrantes: String(ensamble._count.integrantes),
      repertorio: ensamble.piezas.map(({ piezaMusical }) => piezaMusical.nombre).join(', ') || 'Sin repertorio',
      proximoEnsayo: 'Por definir',
      estado: 'Por definir',
    },
  }))

  return (
    <div>
      <ModuleHeader title="Ensambles" description="Consulta integrantes, repertorio y planificación grupal." count={rows.length} />
      <AdminEntityList columns={columns} rows={rows} emptyMessage="No hay ensambles registrados" searchPlaceholder="Buscar ensamble..." />
    </div>
  )
}
