'use client'

import { Archive, Eye, FileDown, Pencil, Plus, RotateCcw, SlidersHorizontal, UserPlus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAdminContext } from '@/components/admin/admin-context'

interface ModuleContext {
  title: string
  createLabel: string
  selectedActions: string[]
}

const studentActionTypes: Record<string, 'edit' | 'deactivate' | 'view' | undefined> = {
  'Ver expediente': 'view',
  Editar: 'edit',
  Desactivar: 'deactivate',
}

const moduleContexts: Record<string, ModuleContext> = {
  '/admin/profesores': {
    title: 'Profesores',
    createLabel: 'Nuevo profesor',
    selectedActions: ['Ver perfil', 'Editar', 'Consultar estudiantes', 'Ver agenda', 'Archivar'],
  },
  '/admin/estudiantes': {
    title: 'Estudiantes',
    createLabel: 'Nuevo estudiante',
    selectedActions: ['Ver expediente', 'Editar', 'Registrar clase', 'Asignar plan', 'Agregar a ensamble', 'Desactivar'],
  },
  '/admin/planes-estudio': {
    title: 'Planes de estudio',
    createLabel: 'Nuevo plan',
    selectedActions: ['Ver estructura', 'Editar', 'Duplicar', 'Crear versión', 'Archivar'],
  },
  '/admin/ensambles': {
    title: 'Ensambles',
    createLabel: 'Nuevo ensamble',
    selectedActions: ['Ver detalle', 'Editar', 'Gestionar integrantes', 'Asignar repertorio', 'Archivar'],
  },
}

function getModuleContext(pathname: string) {
  return Object.entries(moduleContexts).find(([path]) => pathname.startsWith(path))?.[1]
}

export function ContextualMenu() {
  const pathname = usePathname()
  const { selectedEntity, clearSelection, requestAction } = useAdminContext()
  const context = getModuleContext(pathname)

  if (!context) {
    return (
      <section aria-label="Menú contextual" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm xl:min-h-full xl:rounded-none xl:border-y-0 xl:border-r-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Acciones rápidas</p>
        <h2 className="mt-2 text-lg font-bold text-zinc-900">Panel administrativo</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Selecciona un módulo del menú principal para consultar sus acciones.</p>
      </section>
    )
  }

  return (
    <section aria-label="Menú contextual" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm xl:min-h-full xl:rounded-none xl:border-y-0 xl:border-r-0 xl:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Menú contextual</p>

      {selectedEntity ? (
        <>
          <div className="mt-3 rounded-xl bg-zinc-950 p-4 text-white">
            <p className="text-xs text-zinc-400">Registro seleccionado</p>
            <h2 className="mt-1 truncate font-bold">{selectedEntity.label}</h2>
          </div>
          <div className="mt-3 space-y-1" aria-label={`Acciones para ${selectedEntity.label}`}>
            {context.selectedActions.map((action, index) => {
              const actionType = pathname.startsWith('/admin/estudiantes') ? studentActionTypes[action] : undefined
              const enabled = Boolean(actionType)
              const Icon = index === 0 ? Eye : action === 'Editar' ? Pencil : action === 'Desactivar' || action === 'Archivar' ? Archive : UserPlus
              return (
                <button
                  key={action}
                  type="button"
                  disabled={!enabled}
                  onClick={() => actionType && requestAction(actionType)}
                  title={enabled ? undefined : 'Disponible en una siguiente iteración'}
                  className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3b23] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
                >
                  <Icon className="size-4 text-zinc-400" aria-hidden="true" />
                  {action}
                </button>
              )
            })}
          </div>
          <button type="button" onClick={clearSelection} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
            <RotateCcw className="size-4" aria-hidden="true" /> Limpiar selección
          </button>
        </>
      ) : (
        <>
          <h2 className="mt-2 text-lg font-bold text-zinc-900">{context.title}</h2>
          <p className="mt-1 text-sm text-zinc-500">Acciones generales del módulo</p>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => pathname.startsWith('/admin/estudiantes') && requestAction('create')}
              disabled={!pathname.startsWith('/admin/estudiantes')}
              title={pathname.startsWith('/admin/estudiantes') ? undefined : 'Disponible en una siguiente iteración'}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ef3b23] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d9321d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3b23] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              <Plus className="size-4" aria-hidden="true" /> {context.createLabel}
            </button>
            <button type="button" className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
              <SlidersHorizontal className="size-4 text-zinc-400" aria-hidden="true" /> Filtrar registros
            </button>
            <button type="button" className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
              <FileDown className="size-4 text-zinc-400" aria-hidden="true" /> Exportar listado
            </button>
            <button type="button" className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
              <Archive className="size-4 text-zinc-400" aria-hidden="true" /> Ver archivados
            </button>
          </div>
        </>
      )}

      <p className="mt-5 border-t border-zinc-100 pt-4 text-xs leading-5 text-zinc-400">
        {pathname.startsWith('/admin/estudiantes')
          ? 'Creación, edición y desactivación disponibles. Las demás acciones se habilitarán progresivamente.'
          : 'Los formularios y operaciones CRUD se conectarán en una siguiente iteración.'}
      </p>
    </section>
  )
}
