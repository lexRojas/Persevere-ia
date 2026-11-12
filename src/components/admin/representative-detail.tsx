'use client'

import { useRef } from 'react'
import { Eye, X } from 'lucide-react'
import { useAdminContext } from '@/components/admin/admin-context'
import type { AdminRepresentativeDetailData } from '@/types/admin'

interface RepresentativeDetailProps {
  detail: AdminRepresentativeDetailData
  onClose: () => void
}

export function RepresentativeDetail({ detail, onClose }: RepresentativeDetailProps) {
  const { clearAction, clearSelection } = useAdminContext()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const closeDialog = () => {
    clearAction()
    clearSelection()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
      <section role="dialog" aria-modal="true" aria-labelledby="rep-detail-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Representantes</p>
            <h2 id="rep-detail-title" className="mt-1 text-xl font-black text-zinc-900">Perfil del representante</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={closeDialog} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3b23]">
            <X className="size-5" />
          </button>
        </header>

        <div className="p-5">
          <dl className="mt-5 grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 mb-6">
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Nombre</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.nombre}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Correo</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.email}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Teléfono</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.telefono || 'Sin teléfono'}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Relación</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.relacion || 'Sin especificar'}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Dirección</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.direccion || 'Sin dirección'}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Estado</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.estado}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Estudiantes asignados</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.estudiantesList.length}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-zinc-400">Último acceso</dt><dd className="mt-1 text-sm font-semibold text-zinc-800">{detail.ultimoAcceso}</dd></div>
          </dl>

          <h3 className="font-bold text-zinc-900 mb-3">Estudiantes asignados ({detail.estudiantesList.length})</h3>

          {detail.estudiantesList.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500">Este representante no tiene estudiantes asignados.</p>
          ) : (
            <div className="space-y-2">
              {detail.estudiantesList.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                  <div className="flex items-center gap-3">
                    <Eye className="size-4 text-zinc-400" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">{student.nombre}</p>
                      <p className="text-xs text-zinc-500">{student.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-5 flex justify-end border-t border-zinc-100 pt-5">
          <button type="button" onClick={closeDialog} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  )
}
