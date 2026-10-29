'use client'

import Image from 'next/image'
import { Search, LogOut, Settings, UserRound } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { BrandLogo } from '@/components/admin/brand-logo'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative z-30 grid min-h-20 grid-cols-[auto_1fr] items-center gap-3 border-b border-zinc-200 bg-white px-3 shadow-sm md:grid-cols-[220px_1fr_auto] md:px-5">
      <BrandLogo className="hidden md:flex" />

      <div className="relative order-2 w-full max-w-2xl md:order-none md:justify-self-center">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar en Persevere..."
          aria-label="Buscar profesores, estudiantes, planes o ensambles"
          className="h-11 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#ef3b23] focus:bg-white focus:ring-2 focus:ring-[#ef3b23]/15"
        />
      </div>

      <div className="relative order-1 md:order-none md:justify-self-end">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-3 rounded-full p-1.5 text-left outline-none transition hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-[#ef3b23]"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <Image
            src={user.image || '/images/avatar-generic.svg'}
            alt="Avatar del usuario"
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
          <span className="hidden max-w-40 xl:block">
            <span className="block truncate text-sm font-semibold text-zinc-800">{user.name || 'Administrador'}</span>
            <span className="block truncate text-xs text-zinc-500">{user.email}</span>
          </span>
        </button>

        {menuOpen && (
          <div role="menu" className="absolute left-0 top-[calc(100%+0.5rem)] w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl md:left-auto md:right-0">
            <button type="button" role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
              <UserRound className="size-4" /> Mi cuenta
            </button>
            <button type="button" role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
              <Settings className="size-4" /> Configuración
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
