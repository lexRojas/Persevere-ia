'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpenText, GraduationCap, LayoutDashboard, Music2, Settings, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { label: 'Inicio', href: '/admin', icon: LayoutDashboard },
  { label: 'Profesores', href: '/admin/profesores', icon: UsersRound },
  { label: 'Estudiantes', href: '/admin/estudiantes', icon: GraduationCap },
  { label: 'Planes de estudio', href: '/admin/planes-estudio', icon: BookOpenText },
  { label: 'Ensambles', href: '/admin/ensambles', icon: Music2 },
]

export function AdminNavigation() {
  const pathname = usePathname()

  return (
    <nav aria-label="Menú principal" className="flex h-full flex-col border-r border-zinc-200 bg-zinc-950 px-2 py-4 text-white xl:px-3">
      <ul className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex min-h-12 items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium transition xl:justify-start',
                  active ? 'bg-[#ef3b23] text-white shadow-lg shadow-[#ef3b23]/20' : 'text-zinc-400 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="hidden xl:inline">{item.label}</span>
                {active && <span className="absolute -left-2 h-7 w-1 rounded-r-full bg-white xl:-left-3" aria-hidden="true" />}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto border-t border-white/10 pt-3">
        <button type="button" title="Configuración" className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white xl:justify-start">
          <Settings className="size-5" aria-hidden="true" />
          <span className="hidden xl:inline">Configuración</span>
        </button>
      </div>
    </nav>
  )
}
