'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, LoaderCircle, Trash2, X } from 'lucide-react'
import { useAdminContext } from '@/components/admin/admin-context'
import type { AdminRepresentativeDetailData, AdminRepresentativeStudent } from '@/types/admin'

interface RepresentativeAssignStudentsProps {
  detail: AdminRepresentativeDetailData
  availableStudents: AdminRepresentativeStudent[]
  onClose: () => void
}

export function RepresentativeAssignStudents({ detail, availableStudents, onClose }: RepresentativeAssignStudentsProps) {
  const router = useRouter()
  const { clearAction, clearSelection } = useAdminContext()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(detail.estudiantesList.map((s) => s.id))
  )

  const closeDialog = () => {
    if (submitting) return
    clearAction()
    clearSelection()
    onClose()
  }

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const saveStudents = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/representantes/${detail.id}/estudiantes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudianteIds: Array.from(selectedStudentIds) }),
      })
      const result = (await response.json()) as { error?: string; estudianteCount?: number; estudiantes?: AdminRepresentativeStudent[] }
      if (!response.ok) {
        setError(result.error || 'No fue posible guardar los cambios.')
        return
      }
      router.refresh()
      closeDialog()
    } catch {
      setError('No fue posible conectar con el servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  const removeStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const assignedStudents = detail.estudiantesList.filter((s) => selectedStudentIds.has(s.id))
  const availableForSelect = availableStudents.filter((s) => !selectedStudentIds.has(s.id))

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
      <section role="dialog" aria-modal="true" aria-labelledby="rep-assign-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Representantes</p>
            <h2 id="rep-assign-title" className="mt-1 text-xl font-black text-zinc-900">Asignar estudiantes a {detail.nombre}</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={closeDialog} disabled={submitting} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3b23]">
            <X className="size-5" />
          </button>
        </header>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-zinc-500">Selecciona los estudiantes que pertenecen a este representante. Un estudiante solo puede tener un representante.</p>
            </div>
            {availableForSelect.length > 0 ? (
              <select
                className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#ef3b23]"
                onChange={(event) => {
                  const id = event.target.value
                  if (id) toggleStudent(id)
                  event.target.value = ''
                }}
              >
                <option value="">+ Agregar estudiante</option>
                {availableForSelect.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nombre} — {student.email}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-zinc-400 italic">
                No hay estudiantes activos sin representante disponibles para asignar.
              </p>
            )}
          </div>

          <h3 className="font-bold text-zinc-900 mb-3">Estudiantes asignados ({assignedStudents.length})</h3>

          {assignedStudents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500">Este representante no tiene estudiantes asignados.</p>
          ) : (
            <div className="space-y-2">
              {assignedStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                  <div className="flex items-center gap-3">
                    <Eye className="size-4 text-zinc-400" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">{student.nombre}</p>
                      <p className="text-xs text-zinc-500">{student.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStudent(student.id)}
                    aria-label={`Quitar a ${student.nombre}`}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <footer className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <button type="button" onClick={closeDialog} disabled={submitting} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="button" onClick={saveStudents} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9321d] disabled:opacity-50">
              {submitting && <LoaderCircle className="size-4 animate-spin" />} Guardar asignaciones
            </button>
          </footer>
        </div>
      </section>
    </div>
  )
}
