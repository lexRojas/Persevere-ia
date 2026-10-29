'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, LoaderCircle, X } from 'lucide-react'
import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { useAdminContext } from '@/components/admin/admin-context'
import type {
  AdminLevelOption,
  AdminListColumn,
  AdminListRow,
  AdminStudentFormData,
} from '@/types/admin'

interface StudentManagementProps {
  columns: AdminListColumn[]
  rows: AdminListRow[]
  students: AdminStudentFormData[]
  levels: AdminLevelOption[]
}

type DialogMode = 'create' | 'edit' | 'deactivate' | 'view'

const emptyStudent: Omit<AdminStudentFormData, 'id'> = {
  nombre: '',
  email: '',
  nivelId: null,
  fechaIngreso: new Date().toISOString().slice(0, 10),
  estado: 'ACTIVO',
}

export function StudentManagement({ columns, rows, students, levels }: StudentManagementProps) {
  const router = useRouter()
  const { actionRequest, clearAction, clearSelection, selectedEntity } = useAdminContext()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const selectedStudent = students.find((student) => student.id === selectedEntity?.id)
  const requestedMode = actionRequest?.type as DialogMode | undefined
  const mode = requestedMode === 'create' || selectedStudent ? requestedMode ?? null : null

  useEffect(() => {
    if (!mode) return
    closeButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) clearAction()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [clearAction, mode, submitting])

  const closeDialog = () => {
    if (submitting) return
    clearAction()
    setError(null)
  }

  const submitStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mode || mode === 'view' || mode === 'deactivate') return

    setSubmitting(true)
    setError(null)

    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    const payload: Record<string, string | null> = {
      nombre: String(data.get('nombre') ?? ''),
      email: String(data.get('email') ?? ''),
      nivelId: String(data.get('nivelId') ?? '') || null,
      fechaIngreso: String(data.get('fechaIngreso') ?? ''),
      estado: String(data.get('estado') ?? 'ACTIVO'),
    }
    if (mode === 'create' || password) payload.password = password

    try {
      const response = await fetch(
        mode === 'create' ? '/api/admin/estudiantes' : `/api/admin/estudiantes/${selectedStudent?.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error || 'No fue posible guardar los cambios.')
        return
      }

      clearAction()
      clearSelection()
      router.refresh()
    } catch {
      setError('No fue posible conectar con el servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  const deactivateStudent = async () => {
    if (!selectedStudent) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/estudiantes/${selectedStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'INACTIVO' }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error || 'No fue posible desactivar el estudiante.')
        return
      }

      clearAction()
      clearSelection()
      router.refresh()
    } catch {
      setError('No fue posible conectar con el servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  const formStudent = mode === 'create' ? emptyStudent : selectedStudent
  const title = mode === 'create'
    ? 'Nuevo estudiante'
    : mode === 'edit'
      ? 'Editar estudiante'
      : mode === 'view'
        ? 'Expediente del estudiante'
        : 'Desactivar estudiante'

  return (
    <>
      <AdminEntityList
        columns={columns}
        rows={rows}
        emptyMessage="No hay estudiantes registrados"
        searchPlaceholder="Buscar estudiante..."
      />

      {mode && formStudent && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section role="dialog" aria-modal="true" aria-labelledby="student-dialog-title" className="my-6 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Estudiantes</p>
                <h2 id="student-dialog-title" className="mt-1 text-xl font-black text-zinc-900">{title}</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeDialog} disabled={submitting} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3b23]">
                <X className="size-5" />
              </button>
            </header>

            {mode === 'deactivate' ? (
              <div className="p-5">
                <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <p className="text-sm leading-6">
                    <strong>{formStudent.nombre}</strong> pasará a estado Inactivo. Su cuenta, expediente e historial se conservarán.
                  </p>
                </div>
                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <footer className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={closeDialog} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancelar</button>
                  <button type="button" onClick={deactivateStudent} disabled={submitting || formStudent.estado === 'INACTIVO'} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
                    {submitting && <LoaderCircle className="size-4 animate-spin" />} {formStudent.estado === 'INACTIVO' ? 'Ya está inactivo' : 'Confirmar desactivación'}
                  </button>
                </footer>
              </div>
            ) : mode === 'view' ? (
              <div className="p-5">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-[#ef3b23]"><Eye className="size-6" /></span>
                <dl className="mt-5 grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
                  <StudentDetail label="Nombre" value={formStudent.nombre} />
                  <StudentDetail label="Correo" value={formStudent.email} />
                  <StudentDetail label="Nivel" value={levels.find((level) => level.id === formStudent.nivelId)?.nombre || 'Sin nivel'} />
                  <StudentDetail label="Estado" value={formStudent.estado} />
                  <StudentDetail label="Fecha de ingreso" value={formStudent.fechaIngreso} />
                </dl>
              </div>
            ) : (
              <form onSubmit={submitStudent} className="p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Nombre completo" name="nombre" defaultValue={formStudent.nombre} required className="sm:col-span-2" />
                  <FormField label="Correo electrónico" name="email" type="email" defaultValue={formStudent.email} required className="sm:col-span-2" />
                  <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">
                    Nivel
                    <select name="nivelId" defaultValue={formStudent.nivelId || ''} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15">
                      <option value="">Sin nivel</option>
                      {levels.map((level) => <option key={level.id} value={level.id}>{level.nombre}</option>)}
                    </select>
                  </label>
                  <FormField label="Fecha de ingreso" name="fechaIngreso" type="date" defaultValue={formStudent.fechaIngreso} required />
                  <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">
                    Estado
                    <select name="estado" defaultValue={formStudent.estado} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15">
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                      <option value="BAJA">Baja</option>
                    </select>
                  </label>
                  <FormField
                    label={mode === 'create' ? 'Contraseña temporal' : 'Nueva contraseña (opcional)'}
                    name="password"
                    type="password"
                    required={mode === 'create'}
                    minLength={8}
                    className="sm:col-span-2"
                    autoComplete="new-password"
                  />
                </div>

                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <footer className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-5">
                  <button type="button" onClick={closeDialog} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancelar</button>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
                    {submitting && <LoaderCircle className="size-4 animate-spin" />} {mode === 'create' ? 'Crear estudiante' : 'Guardar cambios'}
                  </button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  )
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  className?: string
}

function FormField({ label, className, ...props }: FormFieldProps) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>
      {label}
      <input {...props} className="h-11 rounded-lg border border-zinc-200 px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" />
    </label>
  )
}

function StudentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  )
}
