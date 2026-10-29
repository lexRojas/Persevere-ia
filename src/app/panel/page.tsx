import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

const roleDestinations: Record<string, string> = {
  ADMIN: '/admin',
}

export default async function PanelPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const destination = roleDestinations[session.user.role]
  if (destination) {
    redirect(destination)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 p-6">
      <section className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Persevere</p>
        <h1 className="mt-2 text-2xl font-black text-zinc-900">Sesión iniciada correctamente</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          El panel para el perfil {session.user.role.toLowerCase()} se diseñará en una siguiente especificación.
        </p>
      </section>
    </main>
  )
}
