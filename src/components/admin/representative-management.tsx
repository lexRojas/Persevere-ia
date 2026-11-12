'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, LoaderCircle, X } from 'lucide-react'
import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { useAdminContext } from '@/components/admin/admin-context'
import { RepresentativeDetail } from '@/components/admin/representative-detail'
import type { AdminListColumn, AdminListRow, AdminRepresentativeDetailData, AdminRepresentativeStudent, AdminRepresentanteFormData } from '@/types/admin'

interface RepresentativeManagementProps {
  columns: AdminListColumn[]
  rows: AdminListRow[]
  representatives: AdminRepresentativeDetailData[]
  availableStudents: AdminRepresentativeStudent[]
}

type DialogMode = 'create' | 'edit' | 'deactivate' | 'view'

const emptyRepresentative: Omit<AdminRepresentanteFormData, 'id'> = {
  nombre: '',
  email: '',
  telefono: '',
  relacion: '',
  direccion: '',
  estado: 'ACTIVO',
  estudiantes: '0',
  ultimoAcceso: 'Sin accesos',
}

export function RepresentativeManagement({ columns, rows, representatives, availableStudents }: RepresentativeManagementProps) {
  const router = useRouter()
  const { actionRequest, clearAction, clearSelection, selectedEntity } = useAdminContext()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const selectedRepresentative = representatives.find((rep) => rep.id === selectedEntity?.id)
  const requestedMode = actionRequest?.type as DialogMode | undefined
  const mode = requestedMode === 'create' || selectedRepresentative ? requestedMode ?? null : null

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

  const submitRepresentative = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mode || mode === 'view' || mode === 'deactivate') return

    setSubmitting(true)
    setError(null)

    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    const payload: Record<string, string> = {
      nombre: String(data.get('nombre') ?? ''),
      email: String(data.get('email') ?? ''),
      telefono: String(data.get('telefono') ?? ''),
      relacion: String(data.get('relacion') ?? ''),
      direccion: String(data.get('direccion') ?? ''),
      estado: String(data.get('estado') ?? 'ACTIVO'),
    }
    if (mode === 'create' || password) payload.password = password

    try {
      const response = await fetch(
        mode === 'create' ? '/api/admin/representantes' : `/api/admin/representantes/${selectedRepresentative?.id}`,
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

  const deactivateRepresentative = async () => {
    if (!selectedRepresentative) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/representantes/${selectedRepresentative.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'INACTIVO' }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error || 'No fue posible desactivar el representante.')
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

  const formRep = mode === 'create' ? emptyRepresentative : selectedRepresentative
  const title = mode === 'create'
    ? 'Nuevo representante'
    : mode === 'edit'
      ? 'Editar representante'
      : mode === 'view'
        ? 'Perfil del representante'
        : 'Desactivar representante'

  return (
    <>
      <AdminEntityList
        columns={columns}
        rows={rows}
        emptyMessage="No hay representantes registrados"
        searchPlaceholder="Buscar representante..."
      />

      {mode && formRep && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section role="dialog" aria-modal="true" aria-labelledby="rep-dialog-title" className="my-6 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Representantes</p>
                <h2 id="rep-dialog-title" className="mt-1 text-xl font-black text-zinc-900">{title}</h2>
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
                    <strong>{formRep.nombre}</strong> pasará a estado Inactivo y no podrá iniciar sesión. Su perfil e historial se conservarán.
                  </p>
                </div>
                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <footer className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={closeDialog} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancelar</button>
                  <button type="button" onClick={deactivateRepresentative} disabled={submitting || formRep.estado === 'INACTIVO'} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
                    {submitting && <LoaderCircle className="size-4 animate-spin" />} {formRep.estado === 'INACTIVO' ? 'Ya está inactivo' : 'Confirmar desactivación'}
                  </button>
                </footer>
              </div>
            ) : mode === 'view' ? (
              <RepresentativeDetail
                detail={formRep as AdminRepresentativeDetailData}
                availableStudents={availableStudents}
                onClose={closeDialog}
              />
            ) : (
              <RepresentativeForm
                key={`${mode}-${selectedRepresentative?.id || 'new'}-${actionRequest?.nonce || 0}`}
                rep={formRep}
                mode={mode}
                error={error}
                submitting={submitting}
                onSubmit={submitRepresentative}
                onCancel={closeDialog}
              />
            )}
          </section>
        </div>
      )}
    </>
  )
}

interface RepresentativeFormProps {
  rep: Omit<AdminRepresentanteFormData, 'id'> | AdminRepresentanteFormData
  mode: 'create' | 'edit'
  error: string | null
  submitting: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

function RepresentativeForm({ rep, mode, error, submitting, onSubmit, onCancel }: RepresentativeFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-h-[75vh] overflow-y-auto p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <RepField label="Nombre" name="nombre" defaultValue={rep.nombre} required />
        <RepField label="Correo" name="email" type="email" defaultValue={rep.email} required />
        <RepField label="Teléfono" name="telefono" defaultValue={rep.telefono} />
        <RepField label="Relación" name="relacion" defaultValue={rep.relacion} />
        <RepField label="Dirección" name="direccion" defaultValue={rep.direccion} className="sm:col-span-2" />
        <SelectField label="Estado" defaultValue={rep.estado} options={[['ACTIVO', 'Activo'], ['INACTIVO', 'Inactivo']]} />
        <RepField label="Contraseña temporal" name="password" type="password" placeholder="Mínimo 8 caracteres" />
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <footer className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-5">
        <button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancelar</button>
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
          {submitting && <LoaderCircle className="size-4 animate-spin" />} {mode === 'create' ? 'Crear representante' : 'Guardar cambios'}
        </button>
      </footer>
    </form>
  )
}

function RepField({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>
      {label}
      <input {...props} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" />
    </label>
  )
}

function SelectField({ label, options, defaultValue }: { label: string; options: string[][]; defaultValue: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">
      {label}
      <select defaultValue={defaultValue} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15">
        {options.map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </label>
  )
}
