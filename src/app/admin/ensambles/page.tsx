import { EnsembleManagement } from '@/components/admin/ensemble-management'
import { ModuleHeader } from '@/components/admin/module-header'
import { db } from '@/lib/db'
import { formatDateTime } from '@/lib/utils'
import type { AdminEnsembleFormData, AdminEnsembleOption, AdminListColumn, AdminListRow, AdminMusicPieceFormData } from '@/types/admin'

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
  const [ensambles, docentes, estudiantes, piezasMusicales] = await Promise.all([
    db.ensamble.findMany({
      include: {
        docentes: { where: { activo: true }, include: { docente: { include: { usuario: true } } } },
        integrantes: { where: { activo: true }, include: { estudiante: { include: { usuario: true } } } },
        piezas: { where: { activo: true }, include: { piezaMusical: true } },
        ensayos: { orderBy: { fecha: 'asc' } },
      },
      orderBy: { nombre: 'asc' },
    }),
    db.docente.findMany({ include: { usuario: true }, orderBy: { usuario: { name: 'asc' } } }),
    db.estudiante.findMany({ include: { usuario: true }, orderBy: { usuario: { name: 'asc' } } }),
    db.piezaMusical.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  const now = new Date()

  const rows: AdminListRow[] = ensambles.map((ensamble) => ({
    id: ensamble.id,
    label: ensamble.nombre,
    cells: {
      nombre: ensamble.nombre,
      profesor: ensamble.docentes.map(({ docente }) => docente.usuario.name || docente.usuario.email || 'Sin nombre').join(', ') || 'Sin responsable',
      integrantes: String(ensamble.integrantes.length),
      repertorio: ensamble.piezas.map(({ piezaMusical }) => piezaMusical.nombre).join(', ') || 'Sin repertorio',
      proximoEnsayo: (() => {
        const next = ensamble.ensayos.find((ensayo) => ensayo.estado === 'PROGRAMADO' && ensayo.fecha >= now)
        return next ? formatDateTime(next.fecha) : 'Sin ensayo programado'
      })(),
      estado: ensamble.estado,
    },
  }))

  const ensembleData: AdminEnsembleFormData[] = ensambles.map((ensamble) => ({
    id: ensamble.id,
    nombre: ensamble.nombre,
    descripcion: ensamble.descripcion || '',
    notasCompartidas: ensamble.notasCompartidas || '',
    estado: ensamble.estado,
    docenteIds: ensamble.docentes.map((item) => item.docenteId),
    integrantes: ensamble.integrantes.map((item) => ({ estudianteId: item.estudianteId, rol: item.rol || '' })),
    piezas: ensamble.piezas.map((item) => ({ piezaMusicalId: item.piezaMusicalId, objetivoColectivo: item.objetivoColectivo || '' })),
    ensayos: ensamble.ensayos.map((ensayo) => ({
      id: ensayo.id,
      fecha: ensayo.fecha.toISOString(),
      duracion: ensayo.duracion,
      estado: ensayo.estado,
      notas: ensayo.notas || '',
    })),
  }))

  const teacherOptions: AdminEnsembleOption[] = docentes.map((docente) => ({
    id: docente.id,
    nombre: docente.usuario.name || docente.usuario.email || 'Profesor sin nombre',
    activo: docente.estado === 'ACTIVO',
  }))
  const studentOptions: AdminEnsembleOption[] = estudiantes.map((estudiante) => ({
    id: estudiante.id,
    nombre: estudiante.usuario.name || estudiante.usuario.email || 'Estudiante sin nombre',
    activo: estudiante.estado === 'ACTIVO',
  }))
  const pieceData: AdminMusicPieceFormData[] = piezasMusicales.map((pieza) => ({
    id: pieza.id,
    nombre: pieza.nombre,
    nivel: pieza.nivel || '',
    notas: pieza.notas || '',
    activo: pieza.activo,
  }))

  return (
    <div>
      <ModuleHeader title="Ensambles" description="Consulta integrantes, repertorio y planificación grupal." count={rows.length} />
      <EnsembleManagement
        columns={columns}
        rows={rows}
        ensembles={ensembleData}
        teachers={teacherOptions}
        students={studentOptions}
        musicPieces={pieceData}
      />
    </div>
  )
}
