'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, LoaderCircle, Plus, Trash2, X } from 'lucide-react'
import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { useAdminContext } from '@/components/admin/admin-context'
import type {
  AdminEnsembleFormData,
  AdminEnsembleMemberFormData,
  AdminEnsembleOption,
  AdminEnsemblePieceFormData,
  AdminListColumn,
  AdminListRow,
  AdminMusicPieceFormData,
  AdminRehearsalFormData,
} from '@/types/admin'

interface EnsembleManagementProps {
  columns: AdminListColumn[]
  rows: AdminListRow[]
  ensembles: AdminEnsembleFormData[]
  teachers: AdminEnsembleOption[]
  students: AdminEnsembleOption[]
  musicPieces: AdminMusicPieceFormData[]
}

type DialogMode = 'create' | 'edit' | 'deactivate' | 'view'

const emptyEnsemble: Omit<AdminEnsembleFormData, 'id'> = {
  nombre: '',
  descripcion: '',
  notasCompartidas: '',
  estado: 'ACTIVO',
  docenteIds: [],
  integrantes: [],
  piezas: [],
  ensayos: [],
}

export function EnsembleManagement({ columns, rows, ensembles, teachers, students, musicPieces }: EnsembleManagementProps) {
  const router = useRouter()
  const { actionRequest, clearAction, clearSelection, selectedEntity } = useAdminContext()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const managingPieces = actionRequest?.type === 'manage-pieces'
  const selectedEnsemble = ensembles.find((ensemble) => ensemble.id === selectedEntity?.id)
  const requestedMode = managingPieces ? undefined : actionRequest?.type as DialogMode | undefined
  const mode = requestedMode === 'create' || selectedEnsemble ? requestedMode ?? null : null

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

  const submitEnsemble = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mode || mode === 'view' || mode === 'deactivate') return
    setSubmitting(true)
    setError(null)
    const data = new FormData(event.currentTarget)
    const memberIds = data.getAll('estudianteId').map(String)
    const memberRoles = data.getAll('rol').map(String)
    const pieceIds = data.getAll('piezaMusicalId').map(String)
    const collectiveGoals = data.getAll('objetivoColectivo').map(String)
    const rehearsalIds = data.getAll('ensayoId').map(String)
    const rehearsalDates = data.getAll('fechaEnsayo').map(String)
    const rehearsalDurations = data.getAll('duracion').map(String)
    const rehearsalStatuses = data.getAll('estadoEnsayo').map(String)
    const rehearsalNotes = data.getAll('notasEnsayo').map(String)

    const payload = {
      nombre: String(data.get('nombre') ?? ''),
      descripcion: String(data.get('descripcion') ?? ''),
      notasCompartidas: String(data.get('notasCompartidas') ?? ''),
      estado: String(data.get('estado') ?? 'ACTIVO'),
      docenteIds: data.getAll('docenteIds').map(String),
      integrantes: memberIds.map((estudianteId, index) => ({ estudianteId, rol: memberRoles[index] || '' })),
      piezas: pieceIds.map((piezaMusicalId, index) => ({ piezaMusicalId, objetivoColectivo: collectiveGoals[index] || '' })),
      ensayos: rehearsalDates.map((fecha, index) => ({
        ...(rehearsalIds[index] ? { id: rehearsalIds[index] } : {}),
        fecha: new Date(fecha).toISOString(),
        duracion: rehearsalDurations[index] ? Number(rehearsalDurations[index]) : null,
        estado: rehearsalStatuses[index] || 'PROGRAMADO',
        notas: rehearsalNotes[index] || '',
      })),
    }

    try {
      const response = await fetch(mode === 'create' ? '/api/admin/ensambles' : `/api/admin/ensambles/${selectedEnsemble?.id}`, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'No fue posible guardar el ensamble.')
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

  const archiveEnsemble = async () => {
    if (!selectedEnsemble) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/ensambles/${selectedEnsemble.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ARCHIVADO' }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'No fue posible archivar el ensamble.')
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

  const formEnsemble = mode === 'create' ? emptyEnsemble : selectedEnsemble
  const title = mode === 'create' ? 'Nuevo ensamble' : mode === 'edit' ? 'Editar ensamble' : mode === 'view' ? 'Detalle del ensamble' : 'Archivar ensamble'

  return (
    <>
      <AdminEntityList columns={columns} rows={rows} emptyMessage="No hay ensambles registrados" searchPlaceholder="Buscar ensamble..." />

      {mode && formEnsemble && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section role="dialog" aria-modal="true" aria-labelledby="ensemble-dialog-title" className="my-6 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Ensambles</p><h2 id="ensemble-dialog-title" className="mt-1 text-xl font-black text-zinc-900">{title}</h2></div>
              <button ref={closeButtonRef} type="button" onClick={closeDialog} disabled={submitting} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100"><X className="size-5" /></button>
            </header>
            {mode === 'deactivate' ? (
              <div className="p-5">
                <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p className="text-sm leading-6"><strong>{formEnsemble.nombre}</strong> será archivado. Sus integrantes, repertorio y ensayos se conservarán.</p></div>
                {error && <ErrorMessage message={error} />}
                <footer className="mt-5 flex justify-end gap-3"><SecondaryButton onClick={closeDialog}>Cancelar</SecondaryButton><PrimaryButton onClick={archiveEnsemble} disabled={submitting || formEnsemble.estado === 'ARCHIVADO'} loading={submitting}>{formEnsemble.estado === 'ARCHIVADO' ? 'Ya está archivado' : 'Confirmar archivo'}</PrimaryButton></footer>
              </div>
            ) : mode === 'view' ? (
              <EnsembleDetail ensemble={formEnsemble} teachers={teachers} students={students} pieces={musicPieces} />
            ) : (
              <EnsembleForm key={`${mode}-${selectedEnsemble?.id || 'new'}-${actionRequest?.nonce || 0}`} ensemble={formEnsemble} teachers={teachers} students={students} pieces={musicPieces} mode={mode} error={error} submitting={submitting} onSubmit={submitEnsemble} onCancel={closeDialog} />
            )}
          </section>
        </div>
      )}

      {managingPieces && <MusicPieceCatalog pieces={musicPieces} onClose={closeDialog} />}
    </>
  )
}

interface KeyedMember extends AdminEnsembleMemberFormData { key: string }
interface KeyedPiece extends AdminEnsemblePieceFormData { key: string }
interface KeyedRehearsal extends AdminRehearsalFormData { key: string }

function EnsembleForm({ ensemble, teachers, students, pieces, mode, error, submitting, onSubmit, onCancel }: {
  ensemble: Omit<AdminEnsembleFormData, 'id'> | AdminEnsembleFormData
  teachers: AdminEnsembleOption[]
  students: AdminEnsembleOption[]
  pieces: AdminMusicPieceFormData[]
  mode: 'create' | 'edit'
  error: string | null
  submitting: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  const counter = useRef(0)
  const nextKey = (prefix: string) => `${prefix}-${++counter.current}`
  const [members, setMembers] = useState<KeyedMember[]>(() => ensemble.integrantes.map((item, index) => ({ ...item, key: `member-${index}` })))
  const [assignedPieces, setAssignedPieces] = useState<KeyedPiece[]>(() => ensemble.piezas.map((item, index) => ({ ...item, key: `piece-${index}` })))
  const [rehearsals, setRehearsals] = useState<KeyedRehearsal[]>(() => ensemble.ensayos.map((item, index) => ({ ...item, key: item.id || `rehearsal-${index}` })))

  return (
    <form onSubmit={onSubmit} className="max-h-[78vh] overflow-y-auto p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Nombre" name="nombre" defaultValue={ensemble.nombre} required className="sm:col-span-2" />
        <SelectField label="Estado" name="estado" defaultValue={ensemble.estado} options={[['ACTIVO', 'Activo'], ['INACTIVO', 'Inactivo'], ['ARCHIVADO', 'Archivado']]} />
        <TextArea label="Descripción" name="descripcion" defaultValue={ensemble.descripcion} maxLength={1000} className="sm:col-span-3" />
        <TextArea label="Notas compartidas" name="notasCompartidas" defaultValue={ensemble.notasCompartidas} maxLength={2000} className="sm:col-span-3" />
      </div>

      <FormSection title="Profesores responsables" description="Puedes asignar varios profesores.">
        <div className="flex flex-wrap gap-2">
          {teachers.filter((item) => item.activo || ensemble.docenteIds.includes(item.id)).map((teacher) => (
            <label key={teacher.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
              <input type="checkbox" name="docenteIds" value={teacher.id} defaultChecked={ensemble.docenteIds.includes(teacher.id)} className="accent-[#ef3b23]" /> {teacher.nombre}{!teacher.activo && ' (Inactivo)'}
            </label>
          ))}
          {teachers.length === 0 && <EmptyText text="No hay profesores disponibles." />}
        </div>
      </FormSection>

      <FormSection title="Integrantes" description="Retirar un integrante conserva su historial." actionLabel="Agregar integrante" onAction={() => setMembers((current) => [...current, { key: nextKey('member'), estudianteId: '', rol: '' }])}>
        {members.length === 0 ? <EmptyText text="Sin integrantes activos." /> : members.map((member) => (
          <div key={member.key} className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 sm:grid-cols-[1fr_1fr_auto]">
            <SelectField label="Estudiante" name="estudianteId" defaultValue={member.estudianteId} required options={students.filter((item) => item.activo || item.id === member.estudianteId).map((item) => [item.id, `${item.nombre}${item.activo ? '' : ' (Inactivo)'}`])} placeholder="Seleccionar" />
            <Field label="Rol o instrumento" name="rol" defaultValue={member.rol} maxLength={100} />
            <RemoveButton onClick={() => setMembers((current) => current.filter((item) => item.key !== member.key))} />
          </div>
        ))}
      </FormSection>

      <FormSection title="Repertorio" description="Cada pieza puede tener un objetivo colectivo." actionLabel="Asignar pieza" onAction={() => setAssignedPieces((current) => [...current, { key: nextKey('piece'), piezaMusicalId: '', objetivoColectivo: '' }])}>
        {assignedPieces.length === 0 ? <EmptyText text="Sin repertorio activo." /> : assignedPieces.map((piece) => (
          <div key={piece.key} className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 sm:grid-cols-[1fr_2fr_auto]">
            <SelectField label="Pieza musical" name="piezaMusicalId" defaultValue={piece.piezaMusicalId} required options={pieces.filter((item) => item.activo || item.id === piece.piezaMusicalId).map((item) => [item.id, `${item.nombre}${item.activo ? '' : ' (Archivada)'}`])} placeholder="Seleccionar" />
            <Field label="Objetivo colectivo" name="objetivoColectivo" defaultValue={piece.objetivoColectivo} maxLength={500} />
            <RemoveButton onClick={() => setAssignedPieces((current) => current.filter((item) => item.key !== piece.key))} />
          </div>
        ))}
      </FormSection>

      <FormSection title="Ensayos" description="Programa y conserva el estado de cada ensayo." actionLabel="Programar ensayo" onAction={() => setRehearsals((current) => [...current, { key: nextKey('rehearsal'), fecha: '', duracion: 60, estado: 'PROGRAMADO', notas: '' }])}>
        {rehearsals.length === 0 ? <EmptyText text="Sin ensayos registrados." /> : rehearsals.map((rehearsal) => (
          <div key={rehearsal.key} className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 sm:grid-cols-[1.4fr_100px_150px_auto]">
            <input type="hidden" name="ensayoId" value={rehearsal.id || ''} />
            <Field label="Fecha y hora" name="fechaEnsayo" type="datetime-local" defaultValue={toLocalDateTimeInput(rehearsal.fecha)} required />
            <Field label="Minutos" name="duracion" type="number" min={1} defaultValue={rehearsal.duracion ?? ''} />
            <SelectField label="Estado" name="estadoEnsayo" defaultValue={rehearsal.estado} options={[['PROGRAMADO', 'Programado'], ['REALIZADO', 'Realizado'], ['CANCELADO', 'Cancelado']]} />
            <RemoveButton onClick={() => setRehearsals((current) => current.filter((item) => item.key !== rehearsal.key))} />
            <Field label="Notas" name="notasEnsayo" defaultValue={rehearsal.notas} maxLength={500} className="sm:col-span-4" />
          </div>
        ))}
      </FormSection>

      {error && <ErrorMessage message={error} />}
      <footer className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-5"><SecondaryButton onClick={onCancel}>Cancelar</SecondaryButton><PrimaryButton type="submit" disabled={submitting} loading={submitting}>{mode === 'create' ? 'Crear ensamble' : 'Guardar cambios'}</PrimaryButton></footer>
    </form>
  )
}

function EnsembleDetail({ ensemble, teachers, students, pieces }: { ensemble: Omit<AdminEnsembleFormData, 'id'> | AdminEnsembleFormData; teachers: AdminEnsembleOption[]; students: AdminEnsembleOption[]; pieces: AdminMusicPieceFormData[] }) {
  const names = (ids: string[], options: { id: string; nombre: string }[]) => options.filter((item) => ids.includes(item.id)).map((item) => item.nombre).join(', ') || 'Sin asignar'
  return (
    <div className="max-h-[78vh] overflow-y-auto p-5">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-[#ef3b23]"><Eye className="size-6" /></span>
      <dl className="mt-5 grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2"><Detail label="Nombre" value={ensemble.nombre} /><Detail label="Estado" value={ensemble.estado} /><Detail label="Profesores" value={names(ensemble.docenteIds, teachers)} /><Detail label="Descripción" value={ensemble.descripcion || 'Sin descripción'} /><Detail label="Notas compartidas" value={ensemble.notasCompartidas || 'Sin notas'} /></dl>
      <DetailList title={`Integrantes (${ensemble.integrantes.length})`} values={ensemble.integrantes.map((item) => `${students.find((student) => student.id === item.estudianteId)?.nombre || 'Estudiante'}${item.rol ? ` — ${item.rol}` : ''}`)} />
      <DetailList title={`Repertorio (${ensemble.piezas.length})`} values={ensemble.piezas.map((item) => `${pieces.find((piece) => piece.id === item.piezaMusicalId)?.nombre || 'Pieza'}${item.objetivoColectivo ? ` — ${item.objetivoColectivo}` : ''}`)} />
      <DetailList title={`Ensayos (${ensemble.ensayos.length})`} values={ensemble.ensayos.map((item) => `${new Date(item.fecha).toLocaleString('es-CR')} — ${item.estado}${item.duracion ? ` — ${item.duracion} min` : ''}`)} />
    </div>
  )
}

function MusicPieceCatalog({ pieces, onClose }: { pieces: AdminMusicPieceFormData[]; onClose: () => void }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const save = async (event: React.FormEvent<HTMLFormElement>, id?: string) => {
    event.preventDefault()
    setError(null)
    setSubmitting(id || 'new')
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      const response = await fetch(id ? `/api/admin/piezas-musicales/${id}` : '/api/admin/piezas-musicales', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: String(data.get('nombre') ?? ''), nivel: String(data.get('nivel') ?? ''), notas: String(data.get('notas') ?? ''), activo: String(data.get('estado') ?? 'ACTIVO') === 'ACTIVO' }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) { setError(result.error || 'No fue posible guardar la pieza.'); return }
      if (!id) form.reset()
      router.refresh()
    } catch { setError('No fue posible conectar con el servidor.') } finally { setSubmitting(null) }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="pieces-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-zinc-100 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Catálogo musical</p><h2 id="pieces-title" className="mt-1 text-xl font-black">Gestionar repertorio</h2></div><button type="button" onClick={onClose} disabled={Boolean(submitting)} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full hover:bg-zinc-100"><X className="size-5" /></button></header>
        <div className="max-h-[75vh] overflow-y-auto p-5">
          <form onSubmit={(event) => save(event)} className="rounded-xl border border-dashed border-[#ef3b23]/40 bg-orange-50/40 p-4"><h3 className="font-bold">Nueva pieza</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Nombre" name="nombre" required /><Field label="Nivel" name="nivel" /><Field label="Notas" name="notas" className="sm:col-span-2" /><input type="hidden" name="estado" value="ACTIVO" /></div><PrimaryButton type="submit" disabled={Boolean(submitting)} loading={submitting === 'new'} className="mt-3">Crear pieza</PrimaryButton></form>
          <h3 className="mt-6 font-bold">Piezas configuradas</h3>
          <div className="mt-3 space-y-3">{pieces.length === 0 ? <EmptyText text="Todavía no hay piezas musicales." /> : pieces.map((piece) => (
            <form key={piece.id} onSubmit={(event) => save(event, piece.id)} className="rounded-xl border border-zinc-200 p-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Nombre" name="nombre" defaultValue={piece.nombre} required /><Field label="Nivel" name="nivel" defaultValue={piece.nivel} /><Field label="Notas" name="notas" defaultValue={piece.notas} /><SelectField label="Estado" name="estado" defaultValue={piece.activo ? 'ACTIVO' : 'ARCHIVADO'} options={[['ACTIVO', 'Activa'], ['ARCHIVADO', 'Archivada']]} /></div><SecondaryButton type="submit" disabled={Boolean(submitting)} loading={submitting === piece.id} className="mt-3">Guardar pieza</SecondaryButton></form>
          ))}</div>
          {error && <ErrorMessage message={error} />}
        </div>
      </section>
    </div>
  )
}

function FormSection({ title, description, actionLabel, onAction, children }: { title: string; description: string; actionLabel?: string; onAction?: () => void; children: React.ReactNode }) {
  return <section className="mt-6 border-t border-zinc-100 pt-5"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-bold text-zinc-900">{title}</h3><p className="text-sm text-zinc-500">{description}</p></div>{actionLabel && <button type="button" onClick={onAction} className="inline-flex items-center gap-2 rounded-lg border border-[#ef3b23] px-3 py-2 text-sm font-semibold text-[#ef3b23] hover:bg-orange-50"><Plus className="size-4" />{actionLabel}</button>}</div><div className="space-y-3">{children}</div></section>
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; className?: string }
function Field({ label, className, ...props }: FieldProps) { return <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>{label}<input {...props} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" /></label> }
function TextArea({ label, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }) { return <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>{label}<textarea {...props} rows={3} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" /></label> }
function SelectField({ label, options, placeholder, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[][]; placeholder?: string }) { return <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">{label}<select {...props} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23]">{placeholder && <option value="">{placeholder}</option>}{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label> }
function RemoveButton({ onClick }: { onClick: () => void }) { return <button type="button" onClick={onClick} aria-label="Retirar" title="Retirar" className="mt-6 grid size-10 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button> }
function EmptyText({ text }: { text: string }) { return <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">{text}</p> }
function ErrorMessage({ message }: { message: string }) { return <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p> }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm font-semibold text-zinc-800">{value}</dd></div> }
function DetailList({ title, values }: { title: string; values: string[] }) { return <section className="mt-5"><h3 className="font-bold">{title}</h3>{values.length ? <ul className="mt-2 space-y-2">{values.map((value, index) => <li key={`${index}-${value}`} className="rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700">{value}</li>)}</ul> : <EmptyText text="Sin registros activos." />}</section> }

function PrimaryButton({ loading, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) { return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50 ${className || ''}`}>{loading && <LoaderCircle className="size-4 animate-spin" />}{children}</button> }
function SecondaryButton({ loading, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) { return <button type="button" {...props} className={`inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 ${className || ''}`}>{loading && <LoaderCircle className="size-4 animate-spin" />}{children}</button> }

function toLocalDateTimeInput(value: string) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
