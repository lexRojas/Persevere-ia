export type AdminModuleKey =
  | 'inicio'
  | 'profesores'
  | 'estudiantes'
  | 'planes-estudio'
  | 'ensambles'
  | 'clases'
  | 'representantes'

export interface AdminListColumn {
  key: string
  label: string
  tablet?: boolean
  mobile?: boolean
}

export interface AdminListRow {
  id: string
  label: string
  cells: Record<string, string>
}

export interface SelectedAdminEntity {
  id: string
  label: string
}

export type AdminActionType = 'create' | 'edit' | 'deactivate' | 'view' | 'manage-levels' | 'manage-pieces' | 'assign-students'

export interface AdminActionRequest {
  type: AdminActionType
  nonce: number
}

export interface AdminStudentFormData {
  id: string
  nombre: string
  email: string
  nivelId: string | null
  fechaIngreso: string
  estado: 'ACTIVO' | 'INACTIVO' | 'BAJA'
}

export interface AdminLevelOption {
  id: string
  nombre: string
}

export interface AdminLevelFormData extends AdminLevelOption {
  orden: number
  descripcion: string
  activo: boolean
}

export interface AdminTeacherFormData {
  id: string
  nombre: string
  email: string
  especialidad: string
  estado: 'ACTIVO' | 'INACTIVO' | 'ARCHIVADO'
  estudiantes: string
  proximaClase: string
  ultimoAcceso: string
}

export interface AdminPlanObjectiveFormData {
  id?: string
  unidad: string
  descripcion: string
  criteriosLogro: string
  orden: number
}

export interface AdminStudyPlanFormData {
  id: string
  nombre: string
  version: string
  estado: 'BORRADOR' | 'ACTIVO' | 'ARCHIVADO'
  nivelIds: string[]
  objetivos: AdminPlanObjectiveFormData[]
  actualizacion: string
}

export interface AdminEnsembleOption {
  id: string
  nombre: string
  activo: boolean
}

export interface AdminEnsembleMemberFormData {
  estudianteId: string
  rol: string
}

export interface AdminEnsemblePieceFormData {
  piezaMusicalId: string
  objetivoColectivo: string
}

export interface AdminRehearsalFormData {
  id?: string
  fecha: string
  duracion: number | null
  estado: 'PROGRAMADO' | 'REALIZADO' | 'CANCELADO'
  notas: string
}

export interface AdminEnsembleFormData {
  id: string
  nombre: string
  descripcion: string
  notasCompartidas: string
  estado: 'ACTIVO' | 'INACTIVO' | 'ARCHIVADO'
  docenteIds: string[]
  integrantes: AdminEnsembleMemberFormData[]
  piezas: AdminEnsemblePieceFormData[]
  ensayos: AdminRehearsalFormData[]
}

export interface AdminMusicPieceFormData {
  id: string
  nombre: string
  nivel: string
  notas: string
  activo: boolean
}

export interface AdminClassJournalData {
  objetivosSesion: string
  logrosObservados: string
  dificultades: string
  aspectosRecurrentes: string
  trabajoCasa: string
  notaPrivada: string
  revisionPublicacion: string
  estado: 'BORRADOR' | 'APROBADA'
  version: number
}

export interface AdminJournalRevisionData extends AdminClassJournalData {
  id: string
  editor: string
  createdAt: string
}

export interface AdminClassFormData {
  id: string
  estudianteId: string
  docenteId: string
  fecha: string
  duracion: number | null
  nivel: string
  piezasTrabajadas: string
  estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA'
  bitacora: AdminClassJournalData | null
  revisiones: AdminJournalRevisionData[]
}

export interface AdminRepresentanteFormData {
  id: string
  nombre: string
  email: string
  telefono: string
  relacion: string
  direccion: string
  estado: 'ACTIVO' | 'INACTIVO'
  estudiantes: string
  ultimoAcceso: string
}

export interface AdminRepresentativeStudent {
  id: string
  nombre: string
  email: string
  estado: string
}

export interface AdminRepresentativeDetailData extends AdminRepresentanteFormData {
  estudiantesList: AdminRepresentativeStudent[]
}
