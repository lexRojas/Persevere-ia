'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, LoaderCircle, X } from 'lucide-react'
import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { useAdminContext } from '@/components/admin/admin-context'
import type { AdminListColumn, AdminListRow, AdminTeacherFormData } from '@/types/admin'

interface TeacherManagementProps {
  columns: AdminListColumn[]
  rows: AdminListRow[]
  teachers: AdminTeacherFormData[]
}

type DialogMode = 'create' | 'edit' | 'deactivate' | 'view'

const emptyTeacher: Omit<AdminTeacherFormData, 'id'> = {
  nombre: '',
  email: '',
  especialidad: '',
  estado: 'ACTIVO',
  estudiantes: '0',
  proximaClase: 'Sin clase programada',
  ultimoAcceso: 'Sin accesos',
}

export function TeacherManagement({ columns, rows, teachers }: TeacherManagementProps) {
  const router = useRouter()
  const { actionRequest, clearAction, clearSelection, selectedEntity } = useAdminContext()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedEntity?.id)
  const requestedMode = actionRequest?.type as DialogMode | undefined
  const mode = requestedMode === 'create' || selectedTeacher ? requestedMode ?? null : null

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

  const submitTeacher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mode || mode === 'view' || mode === 'deactivate') return

    setSubmitting(true)
    setError(null)

    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    const payload: Record<string, string> = {
      nombre: String(data.get('nombre') ?? ''),
      email: String(data.get('email') ?? ''),
      especialidad: String(data.get('especialidad') ?? ''),
      estado: String(data.get('estado') ?? 'ACTIVO'),
    }
    if (mode === 'create' || password) payload.password = password

    try {
      const response = await fetch(
        mode === 'create' ? '/api/admin/profesores' : `/api/admin/profesores/${selectedTeacher?.id}`,
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

  const deactivateTeacher = async () => {
    if (!selectedTeacher) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/profesores/${selectedTeacher.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'INACTIVO' }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error || 'No fue posible desactivar el profesor.')
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

  const formTeacher = mode === 'create' ? emptyTeacher : selectedTeacher
  const title = mode === 'create'
    ? 'Nuevo profesor'
    : mode === 'edit'
      ? 'Editar profesor'
      : mode === 'view'
        ? 'Perfil del profesor'
        : 'Desactivar profesor'

  return (
    <>
      <AdminEntityList
        columns={columns}
        rows={rows}
        emptyMessage="No hay profesores registrados"
        searchPlaceholder="Buscar profesor..."
      />

      {mode && formTeacher && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section role="dialog" aria-modal="true" aria-labelledby="teacher-dialog-title" className="my-6 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Profesores</p>
                <h2 id="teacher-dialog-title" className="mt-1 text-xl font-black text-zinc-900">{title}</h2>
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
                    <strong>{formTeacher.nombre}</strong> pasará a estado Inactivo y no podrá iniciar sesión. Su perfil e historial se conservarán.
                  </p>
                </div>
                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <footer className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={closeDialog} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancelar</button>
                  <button type="button" onClick={deactivateTeacher} disabled={submitting || formTeacher.estado === 'INACTIVO'} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
                    {submitting && <LoaderCircle className="size-4 animate-spin" />} {formTeacher.estado === 'INACTIVO' ? 'Ya está inactivo' : 'Confirmar desactivación'}
                  </button>
                </footer>
              </div>
            ) : mode === 'view' ? (
              <div className="p-5">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-[#ef3b23]"><Eye className="size-6" /></span>
                <dl className="mt-5 grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
                  <TeacherDetail label="Nombre" value={formTeacher.nombre} />
                  <TeacherDetail label="Correo" value={formTeacher.email} />
                  <TeacherDetail label="Especialidad" value={formTeacher.especialidad || 'Por definir'} />
                  <TeacherDetail label="Estado" value={formTeacher.estado} />
                  <TeacherDetail label="Estudiantes activos" value={formTeacher.estudiantes} />
                  <TeacherDetail label="Próxima clase" value={formTeacher.proximaClase} />
                  <TeacherDetail label="Último acceso" value={formTeacher.ultimoAcceso} />
                </dl>
              </div>
            ) : (
              <form onSubmit={submitTeacher} className="p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TeacherField label="Nombre completo" name="nombre" defaultValue={formTeacher.nombre} required className="sm:col-span-2" />
                  <TeacherField label="Correo electrónico" name="email" type="email" defaultValue={formTeacher.email} required className="sm:col-span-2" />
                  <TeacherField label="Especialidad" name="especialidad" defaultValue={formTeacher.especialidad} required minLength={2} />
                  <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">
                    Estado
                    <select name="estado" defaultValue={formTeacher.estado} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15">
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                      <option value="ARCHIVADO">Archivado</option>
                    </select>
                  </label>
                  <TeacherField
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
                    {submitting && <LoaderCircle className="size-4 animate-spin" />} {mode === 'create' ? 'Crear profesor' : 'Guardar cambios'}
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

interface TeacherFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  className?: string
}

function TeacherField({ label, className, ...props }: TeacherFieldProps) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>
      {label}
      <input {...props} className="h-11 rounded-lg border border-zinc-200 px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" />
    </label>
  )
}

function TeacherDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  )
}
