'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, History, LoaderCircle, X } from 'lucide-react'
import { AdminEntityList } from '@/components/admin/admin-entity-list'
import { useAdminContext } from '@/components/admin/admin-context'
import type { AdminClassFormData, AdminEnsembleOption, AdminListColumn, AdminListRow } from '@/types/admin'

interface ClassManagementProps {
  columns: AdminListColumn[]
  rows: AdminListRow[]
  classes: AdminClassFormData[]
  students: AdminEnsembleOption[]
  teachers: AdminEnsembleOption[]
  initialStudentId?: string
  initialTeacherId?: string
  initialCreate?: boolean
}

type DialogMode = 'create' | 'edit' | 'deactivate' | 'view'

export function ClassManagement({ columns, rows, classes, students, teachers, initialStudentId, initialTeacherId, initialCreate = false }: ClassManagementProps) {
  const router = useRouter()
  const { actionRequest, clearAction, clearSelection, selectedEntity } = useAdminContext()
  const [queryCreateOpen, setQueryCreateOpen] = useState(initialCreate)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const selectedClass = classes.find((item) => item.id === selectedEntity?.id)
  const requestedMode = actionRequest?.type as DialogMode | undefined
  const mode: DialogMode | null = queryCreateOpen ? 'create' : requestedMode === 'create' || selectedClass ? requestedMode ?? null : null

  const closeDialog = () => {
    if (submitting) return
    clearAction()
    setQueryCreateOpen(false)
    setError(null)
    if (initialCreate) router.replace('/admin/clases')
  }

  useEffect(() => {
    if (!mode) return
    closeButtonRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        clearAction()
        setQueryCreateOpen(false)
        setError(null)
        if (initialCreate) router.replace('/admin/clases')
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [clearAction, initialCreate, mode, router, submitting])

  const emptyClass: Omit<AdminClassFormData, 'id'> = {
    estudianteId: initialStudentId || '',
    docenteId: initialTeacherId || '',
    fecha: '',
    duracion: 60,
    nivel: '',
    piezasTrabajadas: '',
    estado: 'PROGRAMADA',
    bitacora: null,
    revisiones: [],
  }
  const formClass = mode === 'create' ? emptyClass : selectedClass

  const submitClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mode || mode === 'view' || mode === 'deactivate') return
    setSubmitting(true)
    setError(null)
    const data = new FormData(event.currentTarget)
    const payload = {
      estudianteId: String(data.get('estudianteId') ?? ''),
      docenteId: String(data.get('docenteId') ?? ''),
      fecha: new Date(String(data.get('fecha') ?? '')).toISOString(),
      duracion: data.get('duracion') ? Number(data.get('duracion')) : null,
      nivel: String(data.get('nivel') ?? ''),
      piezasTrabajadas: String(data.get('piezasTrabajadas') ?? ''),
      estado: String(data.get('estado') ?? 'PROGRAMADA'),
      bitacora: {
        objetivosSesion: String(data.get('objetivosSesion') ?? ''),
        logrosObservados: String(data.get('logrosObservados') ?? ''),
        dificultades: String(data.get('dificultades') ?? ''),
        aspectosRecurrentes: String(data.get('aspectosRecurrentes') ?? ''),
        trabajoCasa: String(data.get('trabajoCasa') ?? ''),
        notaPrivada: String(data.get('notaPrivada') ?? ''),
        revisionPublicacion: String(data.get('revisionPublicacion') ?? ''),
        estado: String(data.get('estadoBitacora') ?? 'BORRADOR'),
      },
    }

    try {
      const response = await fetch(mode === 'create' ? '/api/admin/clases' : `/api/admin/clases/${selectedClass?.id}`, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'No fue posible guardar la clase.')
        return
      }
      clearAction()
      clearSelection()
      setQueryCreateOpen(false)
      router.replace('/admin/clases')
      router.refresh()
    } catch {
      setError('No fue posible conectar con el servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  const cancelClass = async () => {
    if (!selectedClass) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/clases/${selectedClass.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'CANCELADA' }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'No fue posible cancelar la clase.')
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

  const title = mode === 'create' ? 'Nueva clase' : mode === 'edit' ? 'Editar clase y bitácora' : mode === 'view' ? 'Detalle de clase' : 'Cancelar clase'

  return (
    <>
      <AdminEntityList columns={columns} rows={rows} emptyMessage="No hay clases registradas" searchPlaceholder="Buscar clase, estudiante o profesor..." />
      {mode && formClass && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section role="dialog" aria-modal="true" aria-labelledby="class-dialog-title" className="my-6 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Clases y bitácoras</p><h2 id="class-dialog-title" className="mt-1 text-xl font-black text-zinc-900">{title}</h2></div>
              <button ref={closeButtonRef} type="button" onClick={closeDialog} disabled={submitting} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100"><X className="size-5" /></button>
            </header>
            {mode === 'deactivate' ? (
              <div className="p-5">
                <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p className="text-sm leading-6">La clase será marcada como <strong>Cancelada</strong>. La bitácora y todas sus revisiones se conservarán.</p></div>
                {error && <ErrorMessage message={error} />}
                <footer className="mt-5 flex justify-end gap-3"><Button onClick={closeDialog}>Volver</Button><Button primary onClick={cancelClass} loading={submitting} disabled={submitting || formClass.estado === 'CANCELADA'}>{formClass.estado === 'CANCELADA' ? 'Ya está cancelada' : 'Confirmar cancelación'}</Button></footer>
              </div>
            ) : mode === 'view' ? (
              <ClassDetail classRecord={formClass} students={students} teachers={teachers} />
            ) : (
              <ClassForm key={`${mode}-${selectedClass?.id || 'new'}-${actionRequest?.nonce || 0}`} classRecord={formClass} students={students} teachers={teachers} mode={mode} error={error} submitting={submitting} onSubmit={submitClass} onCancel={closeDialog} />
            )}
          </section>
        </div>
      )}
    </>
  )
}

function ClassForm({ classRecord, students, teachers, mode, error, submitting, onSubmit, onCancel }: {
  classRecord: Omit<AdminClassFormData, 'id'> | AdminClassFormData
  students: AdminEnsembleOption[]
  teachers: AdminEnsembleOption[]
  mode: 'create' | 'edit'
  error: string | null
  submitting: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  const journal = classRecord.bitacora
  return (
    <form onSubmit={onSubmit} className="max-h-[78vh] overflow-y-auto p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Estudiante" name="estudianteId" defaultValue={classRecord.estudianteId} required placeholder="Seleccionar" options={students.filter((item) => item.activo || item.id === classRecord.estudianteId).map((item) => [item.id, `${item.nombre}${item.activo ? '' : ' (Inactivo)'}`])} />
        <Select label="Profesor" name="docenteId" defaultValue={classRecord.docenteId} required placeholder="Seleccionar" options={teachers.filter((item) => item.activo || item.id === classRecord.docenteId).map((item) => [item.id, `${item.nombre}${item.activo ? '' : ' (Inactivo)'}`])} />
        <Field label="Fecha y hora" name="fecha" type="datetime-local" defaultValue={toLocalDateTimeInput(classRecord.fecha)} required />
        <Field label="Duración (min)" name="duracion" type="number" min={1} defaultValue={classRecord.duracion ?? ''} />
        <Field label="Nivel trabajado" name="nivel" defaultValue={classRecord.nivel} maxLength={100} />
        <Select label="Estado" name="estado" defaultValue={classRecord.estado} options={[['PROGRAMADA', 'Programada'], ['REALIZADA', 'Realizada'], ['CANCELADA', 'Cancelada']]} />
        <TextArea label="Piezas trabajadas" name="piezasTrabajadas" defaultValue={classRecord.piezasTrabajadas} className="sm:col-span-2" />
      </div>

      <section className="mt-6 border-t border-zinc-100 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-bold text-zinc-900">Bitácora pedagógica</h3><p className="text-sm text-zinc-500">Cada guardado crea una revisión inmutable.</p></div><Select label="Publicación" name="estadoBitacora" defaultValue={journal?.estado || 'BORRADOR'} options={[['BORRADOR', 'Borrador'], ['APROBADA', 'Aprobada']]} /></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextArea label="Objetivos de la sesión" name="objetivosSesion" defaultValue={journal?.objetivosSesion || ''} />
          <TextArea label="Logros observados" name="logrosObservados" defaultValue={journal?.logrosObservados || ''} />
          <TextArea label="Dificultades" name="dificultades" defaultValue={journal?.dificultades || ''} />
          <TextArea label="Aspectos recurrentes" name="aspectosRecurrentes" defaultValue={journal?.aspectosRecurrentes || ''} />
          <TextArea label="Trabajo para casa" name="trabajoCasa" defaultValue={journal?.trabajoCasa || ''} />
          <TextArea label="Contenido visible al estudiante" name="revisionPublicacion" defaultValue={journal?.revisionPublicacion || ''} />
          <TextArea label="Nota privada del docente" name="notaPrivada" defaultValue={journal?.notaPrivada || ''} className="sm:col-span-2" />
        </div>
      </section>
      {error && <ErrorMessage message={error} />}
      <footer className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-5"><Button onClick={onCancel}>Cancelar</Button><Button primary type="submit" loading={submitting} disabled={submitting}>{mode === 'create' ? 'Crear clase' : 'Guardar nueva revisión'}</Button></footer>
    </form>
  )
}

function ClassDetail({ classRecord, students, teachers }: { classRecord: Omit<AdminClassFormData, 'id'> | AdminClassFormData; students: AdminEnsembleOption[]; teachers: AdminEnsembleOption[] }) {
  const student = students.find((item) => item.id === classRecord.estudianteId)?.nombre || 'Estudiante'
  const teacher = teachers.find((item) => item.id === classRecord.docenteId)?.nombre || 'Profesor'
  const journal = classRecord.bitacora
  return (
    <div className="max-h-[78vh] overflow-y-auto p-5">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-[#ef3b23]"><Eye className="size-6" /></span>
      <dl className="mt-5 grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Estudiante" value={student} /><Detail label="Profesor" value={teacher} /><Detail label="Fecha" value={new Date(classRecord.fecha).toLocaleString('es-CR')} /><Detail label="Estado" value={classRecord.estado} /><Detail label="Duración" value={classRecord.duracion ? `${classRecord.duracion} min` : 'Por definir'} /><Detail label="Nivel" value={classRecord.nivel || 'Por definir'} /><Detail label="Piezas" value={classRecord.piezasTrabajadas || 'Sin piezas'} /></dl>
      <section className="mt-5"><h3 className="font-bold text-zinc-900">Bitácora {journal ? `· v${journal.version} · ${journal.estado}` : ''}</h3>{journal ? <dl className="mt-3 grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2"><Detail label="Objetivos" value={journal.objetivosSesion || 'Sin registro'} /><Detail label="Logros" value={journal.logrosObservados || 'Sin registro'} /><Detail label="Dificultades" value={journal.dificultades || 'Sin registro'} /><Detail label="Aspectos recurrentes" value={journal.aspectosRecurrentes || 'Sin registro'} /><Detail label="Trabajo para casa" value={journal.trabajoCasa || 'Sin registro'} /><Detail label="Contenido publicado" value={journal.revisionPublicacion || 'Sin publicación'} /><Detail label="Nota privada" value={journal.notaPrivada || 'Sin nota privada'} /></dl> : <Empty text="Esta clase todavía no tiene bitácora." />}</section>
      <section className="mt-5"><h3 className="flex items-center gap-2 font-bold text-zinc-900"><History className="size-4 text-[#ef3b23]" />Historial de revisiones</h3>{classRecord.revisiones.length ? <ol className="mt-3 space-y-2">{classRecord.revisiones.map((revision) => <li key={revision.id} className="rounded-xl border border-zinc-200 p-4"><p className="text-sm font-bold">Versión {revision.version} · {revision.estado}</p><p className="mt-1 text-xs text-zinc-500">{revision.editor} · {new Date(revision.createdAt).toLocaleString('es-CR')}</p></li>)}</ol> : <Empty text="Sin revisiones registradas." />}</section>
    </div>
  )
}

function Field({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) { return <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>{label}<input {...props} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" /></label> }
function TextArea({ label, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }) { return <label className={`grid gap-1.5 text-sm font-semibold text-zinc-700 ${className || ''}`}>{label}<textarea {...props} rows={3} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-normal outline-none focus:border-[#ef3b23] focus:ring-2 focus:ring-[#ef3b23]/15" /></label> }
function Select({ label, options, placeholder, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[][]; placeholder?: string }) { return <label className="grid gap-1.5 text-sm font-semibold text-zinc-700">{label}<select {...props} className="h-11 rounded-lg border border-zinc-200 bg-white px-3 font-normal outline-none focus:border-[#ef3b23]">{placeholder && <option value="">{placeholder}</option>}{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label> }
function Button({ primary, loading, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; loading?: boolean }) { return <button type="button" {...props} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${primary ? 'bg-[#ef3b23] text-white hover:bg-[#d9321d]' : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50'} ${className || ''}`}>{loading && <LoaderCircle className="size-4 animate-spin" />}{children}</button> }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm font-semibold text-zinc-800">{value}</dd></div> }
function Empty({ text }: { text: string }) { return <p className="mt-3 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">{text}</p> }
function ErrorMessage({ message }: { message: string }) { return <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p> }
function toLocalDateTimeInput(value: string) { if (!value) return ''; const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) }
