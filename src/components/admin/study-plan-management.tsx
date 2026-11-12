'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowDown, ArrowUp, Eye, LoaderCircle, Plus, Trash2, X } from 'lucide-react'
import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { useAdminContext } from '@/components/admin/admin-context'
import type {
  AdminLevelFormData,
  AdminListColumn,
  AdminListRow,
  AdminPlanObjectiveFormData,
  AdminStudyPlanFormData,
} from '@/types/admin'

interface StudyPlanManagementProps {
  columns: AdminListColumn[]
  rows: AdminListRow[]
  plans: AdminStudyPlanFormData[]
  levels: AdminLevelFormData[]
}

type DialogMode = 'create' | 'edit' | 'deactivate' | 'view'

const emptyPlan: Omit<AdminStudyPlanFormData, 'id'> = {
  nombre: '',
  version: '1.0',
  estado: 'BORRADOR',
  nivelIds: [],
  objetivos: [],
  actualizacion: '',
}

export function StudyPlanManagement({ columns, rows, plans, levels }: StudyPlanManagementProps) {
  const router = useRouter()
  const { actionRequest, clearAction, clearSelection, selectedEntity } = useAdminContext()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const selectedPlan = plans.find((plan) => plan.id === selectedEntity?.id)
  const managingLevels = actionRequest?.type === 'manage-levels'
  const requestedMode = managingLevels ? undefined : actionRequest?.type as DialogMode | undefined
  const mode = requestedMode === 'create' || selectedPlan ? requestedMode ?? null : null

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

  const submitPlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mode || mode === 'view' || mode === 'deactivate') return

    setSubmitting(true)
    setError(null)

    const data = new FormData(event.currentTarget)
    const objectiveIds = data.getAll('objetivoId').map(String)
    const units = data.getAll('unidad').map(String)
    const descriptions = data.getAll('descripcion').map(String)
    const criteria = data.getAll('criteriosLogro').map(String)
    const objetivos = units.map((unidad, index) => ({
      ...(objectiveIds[index] ? { id: objectiveIds[index] } : {}),
      unidad,
      descripcion: descriptions[index] || '',
      criteriosLogro: criteria[index] || '',
      orden: index + 1,
    }))
    const payload = {
      nombre: String(data.get('nombre') ?? ''),
      version: String(data.get('version') ?? ''),
      estado: String(data.get('estado') ?? 'BORRADOR'),
      nivelIds: data.getAll('nivelIds').map(String),
      objetivos,
    }

    try {
      const response = await fetch(
        mode === 'create' ? '/api/admin/planes-estudio' : `/api/admin/planes-estudio/${selectedPlan?.id}`,
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

  const archivePlan = async () => {
    if (!selectedPlan) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/planes-estudio/${selectedPlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ARCHIVADO' }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error || 'No fue posible archivar el plan.')
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

  const formPlan = mode === 'create' ? emptyPlan : selectedPlan
  const title = mode === 'create'
    ? 'Nuevo plan de estudio'
    : mode === 'edit'
      ? 'Editar plan de estudio'
      : mode === 'view'
        ? 'Estructura del plan'
        : 'Archivar plan de estudio'

  return (
    <>
      <AdminEntityList
        columns={columns}
        rows={rows}
        emptyMessage="No hay planes de estudio"
        searchPlaceholder="Buscar plan de estudio..."
      />

      {mode && formPlan && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section role="dialog" aria-modal="true" aria-labelledby="plan-dialog-title" className="my-6 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Planes de estudio</p>
                <h2 id="plan-dialog-title" className="mt-1 text-xl font-black text-zinc-900">{title}</h2>
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
                    <strong>{formPlan.nombre} — {formPlan.version}</strong> será archivado. Sus objetivos y el progreso histórico se conservarán.
                  </p>
                </div>
                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <footer className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={closeDialog} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancelar</button>
                  <button type="button" onClick={archivePlan} disabled={submitting || formPlan.estado === 'ARCHIVADO'} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
                    {submitting && <LoaderCircle className="size-4 animate-spin" />} {formPlan.estado === 'ARCHIVADO' ? 'Ya está archivado' : 'Confirmar archivo'}
                  </button>
                </footer>
              </div>
            ) : mode === 'view' ? (
              <PlanStructure plan={formPlan} levels={levels} />
            ) : (
              <PlanForm
                key={`${mode}-${selectedPlan?.id || 'new'}-${actionRequest?.nonce || 0}`}
                plan={formPlan}
                levels={levels}
                mode={mode}
                error={error}
                submitting={submitting}
                onSubmit={submitPlan}
                onCancel={closeDialog}
              />
            )}
          </section>
        </div>
      )}

      {managingLevels && (
        <LevelCatalogDialog levels={levels} onClose={closeDialog} />
      )}
    </>
  )
}

interface EditableObjective extends AdminPlanObjectiveFormData {
  key: string
}

function PlanForm({ plan, levels, mode, error, submitting, onSubmit, onCancel }: {
  plan: Omit<AdminStudyPlanFormData, 'id'> | AdminStudyPlanFormData
  levels: AdminLevelFormData[]
  mode: 'create' | 'edit'
  error: string | null
  submitting: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  const newObjectiveCounter = useRef(0)
  const [objectives, setObjectives] = useState<EditableObjective[]>(() =>
    plan.objetivos.map((objective, index) => ({ ...objective, key: objective.id || `initial-${index}` })),
  )

  const addObjective = () => {
    newObjectiveCounter.current += 1
    setObjectives((current) => [...current, {
      key: `new-${newObjectiveCounter.current}`,
      unidad: '',
      descripcion: '',
      criteriosLogro: '',
      orden: current.length + 1,
    }])
  }

  const removeObjective = (key: string) => {
    setObjectives((current) => current.filter((objective) => objective.key !== key))
  }

  const moveObjective = (index: number, direction: -1 | 1) => {
    setObjectives((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const reordered = [...current]
      ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
      return reordered
    })
  }

  return (
    <form onSubmit={onSubmit} className="max-h-[75vh] overflow-y-auto p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <PlanField label="Nombre" name="nombre" defaultValue={plan.nombre} required className="sm:col-span-2" />
        <PlanField label="Versión" name="version" defaultValue={plan.version} required />
        <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">
          Estado
          <select name="estado" defaultValue={plan.estado} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15">
            <option value="BORRADOR">Borrador</option>
            <option value="ACTIVO">Activo</option>
            <option value="ARCHIVADO">Archivado</option>
          </select>
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-zinc-700">Niveles aplicables</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {levels.length === 0 ? <p className="text-sm text-zinc-500">No hay niveles configurados.</p> : levels.filter((level) => level.activo || plan.nivelIds.includes(level.id)).map((level) => (
              <label key={level.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
                <input type="checkbox" name="nivelIds" value={level.id} defaultChecked={plan.nivelIds.includes(level.id)} className="accent-[#ef3b23]" />
                {level.nombre}{!level.activo && ' (Archivado)'}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <section className="mt-6 border-t border-zinc-100 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-zinc-900">Objetivos curriculares</h3>
            <p className="text-sm text-zinc-500">El orden de esta lista será el orden pedagógico.</p>
          </div>
          <button type="button" onClick={addObjective} className="inline-flex items-center gap-2 rounded-lg border border-[#ef3b23] px-3 py-2 text-sm font-semibold text-[#ef3b23] hover:bg-orange-50">
            <Plus className="size-4" /> Agregar objetivo
          </button>
        </div>

        {objectives.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500">Este borrador todavía no tiene objetivos.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {objectives.map((objective, index) => (
              <article key={objective.key} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                <input type="hidden" name="objetivoId" value={objective.id || ''} />
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm text-zinc-800">Objetivo {index + 1}</strong>
                  <div className="flex gap-1">
                    <ObjectiveButton label="Subir" disabled={index === 0} onClick={() => moveObjective(index, -1)}><ArrowUp className="size-4" /></ObjectiveButton>
                    <ObjectiveButton label="Bajar" disabled={index === objectives.length - 1} onClick={() => moveObjective(index, 1)}><ArrowDown className="size-4" /></ObjectiveButton>
                    <ObjectiveButton label="Retirar" onClick={() => removeObjective(objective.key)} destructive><Trash2 className="size-4" /></ObjectiveButton>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <PlanField label="Unidad o área" name="unidad" defaultValue={objective.unidad} required />
                  <label className="grid gap-1.5 text-sm font-semibold text-zinc-700 sm:col-span-2">
                    Descripción
                    <textarea name="descripcion" defaultValue={objective.descripcion} required maxLength={500} rows={2} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" />
                  </label>
                  <label className="grid gap-1.5 text-sm font-semibold text-zinc-700 sm:col-span-2">
                    Criterios de logro (opcional)
                    <textarea name="criteriosLogro" defaultValue={objective.criteriosLogro} maxLength={1000} rows={2} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" />
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <footer className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-5">
        <button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancelar</button>
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
          {submitting && <LoaderCircle className="size-4 animate-spin" />} {mode === 'create' ? 'Crear plan' : 'Guardar cambios'}
        </button>
      </footer>
    </form>
  )
}

function PlanStructure({ plan, levels }: { plan: Omit<AdminStudyPlanFormData, 'id'> | AdminStudyPlanFormData; levels: AdminLevelFormData[] }) {
  const levelNames = levels.filter((level) => plan.nivelIds.includes(level.id)).map((level) => level.nombre)
  return (
    <div className="max-h-[75vh] overflow-y-auto p-5">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-[#ef3b23]"><Eye className="size-6" /></span>
      <dl className="mt-5 grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
        <PlanDetail label="Nombre" value={plan.nombre} />
        <PlanDetail label="Versión" value={plan.version} />
        <PlanDetail label="Estado" value={plan.estado} />
        <PlanDetail label="Niveles" value={levelNames.join(', ') || 'Sin niveles'} />
      </dl>
      <h3 className="mt-5 font-bold text-zinc-900">Objetivos ({plan.objetivos.length})</h3>
      {plan.objetivos.length === 0 ? (
        <p className="mt-2 rounded-xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500">Sin objetivos activos.</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {plan.objetivos.map((objective) => (
            <li key={objective.id || `${objective.orden}-${objective.descripcion}`} className="rounded-xl border border-zinc-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#ef3b23]">{objective.orden}. {objective.unidad}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-800">{objective.descripcion}</p>
              {objective.criteriosLogro && <p className="mt-2 text-sm leading-6 text-zinc-500">Criterios: {objective.criteriosLogro}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function LevelCatalogDialog({ levels, onClose }: { levels: AdminLevelFormData[]; onClose: () => void }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)

  const saveLevel = async (event: React.FormEvent<HTMLFormElement>, levelId?: string) => {
    event.preventDefault()
    setError(null)
    setSubmitting(levelId || 'new')
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      nombre: String(data.get('nombre') ?? ''),
      orden: Number(data.get('orden') ?? 0),
      descripcion: String(data.get('descripcion') ?? ''),
      activo: String(data.get('estado') ?? 'ACTIVO') === 'ACTIVO',
    }

    try {
      const response = await fetch(levelId ? `/api/admin/niveles/${levelId}` : '/api/admin/niveles', {
        method: levelId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'No fue posible guardar el nivel.')
        return
      }
      if (!levelId) form.reset()
      router.refresh()
    } catch {
      setError('No fue posible conectar con el servidor.')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="level-dialog-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Catálogo académico</p>
            <h2 id="level-dialog-title" className="mt-1 text-xl font-black text-zinc-900">Gestionar niveles</h2>
          </div>
          <button type="button" onClick={onClose} disabled={Boolean(submitting)} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3b23]">
            <X className="size-5" />
          </button>
        </header>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <form onSubmit={(event) => saveLevel(event)} className="rounded-xl border border-dashed border-[#ef3b23]/40 bg-orange-50/40 p-4">
            <h3 className="font-bold text-zinc-900">Nuevo nivel</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_110px]">
              <PlanField label="Nombre" name="nombre" required />
              <PlanField label="Orden" name="orden" type="number" min={0} defaultValue={levels.length + 1} required />
              <PlanField label="Descripción (opcional)" name="descripcion" className="sm:col-span-2" />
              <input type="hidden" name="estado" value="ACTIVO" />
            </div>
            <button type="submit" disabled={Boolean(submitting)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {submitting === 'new' && <LoaderCircle className="size-4 animate-spin" />} Crear nivel
            </button>
          </form>

          <h3 className="mt-6 font-bold text-zinc-900">Niveles configurados</h3>
          {levels.length === 0 ? (
            <p className="mt-2 rounded-xl border border-zinc-200 p-5 text-center text-sm text-zinc-500">Todavía no hay niveles.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {levels.map((level) => (
                <form key={level.id} onSubmit={(event) => saveLevel(event, level.id)} className="rounded-xl border border-zinc-200 p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_100px_140px]">
                    <PlanField label="Nombre" name="nombre" defaultValue={level.nombre} required />
                    <PlanField label="Orden" name="orden" type="number" min={0} defaultValue={level.orden} required />
                    <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">
                      Estado
                      <select name="estado" defaultValue={level.activo ? 'ACTIVO' : 'ARCHIVADO'} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23]">
                        <option value="ACTIVO">Activo</option>
                        <option value="ARCHIVADO">Archivado</option>
                      </select>
                    </label>
                    <PlanField label="Descripción" name="descripcion" defaultValue={level.descripcion} className="sm:col-span-3" />
                  </div>
                  <button type="submit" disabled={Boolean(submitting)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
                    {submitting === level.id && <LoaderCircle className="size-4 animate-spin" />} Guardar nivel
                  </button>
                </form>
              ))}
            </div>
          )}
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
      </section>
    </div>
  )
}

interface PlanFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  className?: string
}

function PlanField({ label, className, ...props }: PlanFieldProps) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>
      {label}
      <input {...props} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" />
    </label>
  )
}

function ObjectiveButton({ label, disabled, onClick, destructive, children }: { label: string; disabled?: boolean; onClick: () => void; destructive?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className={`grid size-8 place-items-center rounded-lg disabled:opacity-30 ${destructive ? 'text-red-600 hover:bg-red-50' : 'text-zinc-500 hover:bg-zinc-200'}`}>
      {children}
    </button>
  )
}

function PlanDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  )
}
