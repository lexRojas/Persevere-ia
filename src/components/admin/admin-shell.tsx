'use client'

import { usePathname } from 'next/navigation'
import { AdminContextProvider } from '@/components/admin/admin-context'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminNavigation } from '@/components/admin/admin-navigation'
import { ContextualMenu } from '@/components/admin/contextual-menu'

interface AdminShellProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  children: React.ReactNode
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <AdminHeader user={user} />
      <AdminContextProvider key={pathname}>
        <div className="grid min-h-[calc(100vh-5rem)] grid-cols-[64px_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[80px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-rows-1">
          <aside className="col-start-1 row-span-2 row-start-1 xl:row-span-1" aria-label="Navegación administrativa">
            <AdminNavigation />
          </aside>

          <aside className="col-start-2 row-start-1 p-3 pb-0 xl:col-start-3 xl:p-0" aria-label="Acciones contextuales">
            <div className="xl:sticky xl:top-0 xl:h-[calc(100vh-5rem)]">
              <ContextualMenu />
            </div>
          </aside>

          <main className="col-start-2 row-start-2 min-w-0 p-3 md:p-5 xl:col-start-2 xl:row-start-1 xl:p-7">
            {children}
          </main>
        </div>
      </AdminContextProvider>
    </div>
  )
}
