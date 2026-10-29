export type AdminModuleKey =
  | 'inicio'
  | 'profesores'
  | 'estudiantes'
  | 'planes-estudio'
  | 'ensambles'

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

export type AdminActionType = 'create' | 'edit' | 'deactivate' | 'view'

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
