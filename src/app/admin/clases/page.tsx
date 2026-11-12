import { ClassManagement } from '@/components/admin/class-management'
import { ModuleHeader } from '@/components/admin/module-header'
import { db } from '@/lib/db'
import { formatDateTime } from '@/lib/utils'
import type { AdminClassFormData, AdminEnsembleOption, AdminListColumn, AdminListRow } from '@/types/admin'

export const dynamic = 'force-dynamic'

const columns: AdminListColumn[] = [
  { key: 'fecha', label: 'Fecha y hora', tablet: true, mobile: true },
  { key: 'estudiante', label: 'Estudiante', tablet: true, mobile: true },
  { key: 'profesor', label: 'Profesor', tablet: true },
  { key: 'duracion', label: 'Duración' },
  { key: 'bitacora', label: 'Bitácora', tablet: true },
  { key: 'estado', label: 'Estado', tablet: true, mobile: true },
]

interface ClassesPageProps {
  searchParams: Promise<{ estudianteId?: string; docenteId?: string; action?: string }>
}

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const query = await searchParams
  const [classes, students, teachers] = await Promise.all([
    db.clase.findMany({
      where: {
        ...(query.estudianteId ? { estudianteId: query.estudianteId } : {}),
        ...(query.docenteId ? { docenteId: query.docenteId } : {}),
      },
      include: {
        estudiante: { include: { usuario: true } },
        docente: { include: { usuario: true } },
        bitacora: {
          include: {
            revisiones: { include: { editadoPor: true }, orderBy: { version: 'desc' } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    }),
    db.estudiante.findMany({ include: { usuario: true }, orderBy: { usuario: { name: 'asc' } } }),
    db.docente.findMany({ include: { usuario: true }, orderBy: { usuario: { name: 'asc' } } }),
  ])

  const rows: AdminListRow[] = classes.map((classRecord) => ({
    id: classRecord.id,
    label: `${classRecord.estudiante.usuario.name || 'Estudiante'} — ${formatDateTime(classRecord.fecha)}`,
    cells: {
      fecha: formatDateTime(classRecord.fecha),
      estudiante: classRecord.estudiante.usuario.name || classRecord.estudiante.usuario.email || 'Sin nombre',
      profesor: classRecord.docente.usuario.name || classRecord.docente.usuario.email || 'Sin nombre',
      duracion: classRecord.duracion ? `${classRecord.duracion} min` : 'Por definir',
      bitacora: classRecord.bitacora ? `${classRecord.bitacora.estado} · v${classRecord.bitacora.version}` : 'Sin bitácora',
      estado: classRecord.estado,
    },
  }))

  const classData: AdminClassFormData[] = classes.map((classRecord) => ({
    id: classRecord.id,
    estudianteId: classRecord.estudianteId,
    docenteId: classRecord.docenteId,
    fecha: classRecord.fecha.toISOString(),
    duracion: classRecord.duracion,
    nivel: classRecord.nivel || '',
    piezasTrabajadas: classRecord.piezasTrabajadas || '',
    estado: classRecord.estado,
    bitacora: classRecord.bitacora ? {
      objetivosSesion: classRecord.bitacora.objetivosSesion || '',
      logrosObservados: classRecord.bitacora.logrosObservados || '',
      dificultades: classRecord.bitacora.dificultades || '',
      aspectosRecurrentes: classRecord.bitacora.aspectosRecurrentes || '',
      trabajoCasa: classRecord.bitacora.trabajoCasa || '',
      notaPrivada: classRecord.bitacora.notaPrivada || '',
      revisionPublicacion: classRecord.bitacora.revisionPublicacion || '',
      estado: classRecord.bitacora.estado,
      version: classRecord.bitacora.version,
    } : null,
    revisiones: classRecord.bitacora?.revisiones.map((revision) => ({
      id: revision.id,
      objetivosSesion: revision.objetivosSesion || '',
      logrosObservados: revision.logrosObservados || '',
      dificultades: revision.dificultades || '',
      aspectosRecurrentes: revision.aspectosRecurrentes || '',
      trabajoCasa: revision.trabajoCasa || '',
      notaPrivada: revision.notaPrivada || '',
      revisionPublicacion: revision.revisionPublicacion || '',
      estado: revision.estado,
      version: revision.version,
      editor: revision.editadoPor?.name || revision.editadoPor?.email || 'Usuario eliminado',
      createdAt: revision.createdAt.toISOString(),
    })) || [],
  }))

  const studentOptions: AdminEnsembleOption[] = students.map((student) => ({
    id: student.id,
    nombre: student.usuario.name || student.usuario.email || 'Estudiante sin nombre',
    activo: student.estado === 'ACTIVO',
  }))
  const teacherOptions: AdminEnsembleOption[] = teachers.map((teacher) => ({
    id: teacher.id,
    nombre: teacher.usuario.name || teacher.usuario.email || 'Profesor sin nombre',
    activo: teacher.estado === 'ACTIVO',
  }))

  return (
    <div>
      <ModuleHeader title="Clases y bitácoras" description="Gestiona la agenda individual y el seguimiento pedagógico de cada sesión." count={rows.length} />
      <ClassManagement
        columns={columns}
        rows={rows}
        classes={classData}
        students={studentOptions}
        teachers={teacherOptions}
        initialStudentId={query.estudianteId}
        initialTeacherId={query.docenteId}
        initialCreate={query.action === 'create'}
      />
    </div>
  )
}
