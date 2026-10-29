'use client'

import { Search, Inbox } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAdminContext } from '@/components/admin/admin-context'
import { cn } from '@/lib/utils'
import type { AdminListColumn, AdminListRow } from '@/types/admin'

interface AdminEntityListProps {
  columns: AdminListColumn[]
  rows: AdminListRow[]
  emptyMessage: string
  searchPlaceholder: string
}

export function AdminEntityList({ columns, rows, emptyMessage, searchPlaceholder }: AdminEntityListProps) {
  const [query, setQuery] = useState('')
  const { selectedEntity, selectEntity } = useAdminContext()

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    if (!normalized) return rows

    return rows.filter((row) =>
      [row.label, ...Object.values(row.cells)].some((value) => value.toLocaleLowerCase('es').includes(normalized)),
    )
  }, [query, rows])

  const selectRow = (row: AdminListRow) => selectEntity({ id: row.id, label: row.label })

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#ef3b23] focus:bg-white focus:ring-2 focus:ring-[#ef3b23]/15"
          />
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-zinc-100">
              <Inbox className="size-6 text-zinc-400" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-bold text-zinc-800">{query ? 'Sin coincidencias' : emptyMessage}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {query ? 'Prueba con otro término de búsqueda.' : 'Utiliza el menú contextual para crear el primer registro.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col" className={cn('whitespace-nowrap px-4 py-3 font-bold', !column.tablet && 'hidden xl:table-cell')}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRows.map((row) => {
                  const selected = selectedEntity?.id === row.id
                  return (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      aria-selected={selected}
                      onClick={() => selectRow(row)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          selectRow(row)
                        }
                      }}
                      className={cn(
                        'cursor-pointer outline-none transition hover:bg-orange-50/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef3b23]',
                        selected && 'bg-orange-50 shadow-[inset_4px_0_0_#ef3b23]',
                      )}
                    >
                      {columns.map((column, index) => (
                        <td key={column.key} className={cn('max-w-64 px-4 py-4 text-zinc-600', !column.tablet && 'hidden xl:table-cell', index === 0 && 'font-semibold text-zinc-900')}>
                          {column.key === 'estado' ? (
                            <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">{row.cells[column.key] || '—'}</span>
                          ) : (
                            <span className="line-clamp-2">{row.cells[column.key] || '—'}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-zinc-100 md:hidden">
            {filteredRows.map((row) => {
              const selected = selectedEntity?.id === row.id
              const mobileColumns = columns.filter((column) => column.mobile)

              return (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectRow(row)}
                  className={cn(
                    'block w-full px-4 py-4 text-left outline-none transition hover:bg-orange-50/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef3b23]',
                    selected && 'bg-orange-50 shadow-[inset_4px_0_0_#ef3b23]',
                  )}
                >
                  <p className="font-bold text-zinc-900">{row.label}</p>
                  <dl className="mt-2 grid gap-1.5 text-sm">
                    {mobileColumns.slice(1).map((column) => (
                      <div key={column.key} className="flex justify-between gap-4">
                        <dt className="text-zinc-400">{column.label}</dt>
                        <dd className="text-right font-medium text-zinc-700">{row.cells[column.key] || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </button>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
