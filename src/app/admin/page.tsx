import Link from 'next/link'
import { BookOpenText, GraduationCap, Music2, UsersRound } from 'lucide-react'
import { ModuleHeader } from '@/components/admin/module-header'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [profesores, estudiantes, planes, ensambles] = await Promise.all([
    db.docente.count(),
    db.estudiante.count(),
    db.planEstudios.count(),
    db.ensamble.count(),
  ])

  const modules = [
    { label: 'Profesores', count: profesores, href: '/admin/profesores', icon: UsersRound, description: 'Perfiles, agenda y estudiantes relacionados.' },
    { label: 'Estudiantes', count: estudiantes, href: '/admin/estudiantes', icon: GraduationCap, description: 'Expedientes, objetivos y seguimiento.' },
    { label: 'Planes de estudio', count: planes, href: '/admin/planes-estudio', icon: BookOpenText, description: 'Currículo, versiones y objetivos.' },
    { label: 'Ensambles', count: ensambles, href: '/admin/ensambles', icon: Music2, description: 'Integrantes, repertorio y ensayos.' },
  ]

  return (
    <div>
      <ModuleHeader title="Panel administrativo" description="Gestiona la operación académica de Persevere desde un solo lugar." />

      <section aria-label="Resumen de módulos" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.href} href={module.href} className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#ef3b23]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3b23]">
              <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-[#ef3b23] transition group-hover:bg-[#ef3b23] group-hover:text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-bold text-zinc-900">{module.label}</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{module.description}</p>
                </div>
                <strong className="text-3xl font-black text-zinc-900">{module.count}</strong>
              </div>
            </Link>
          )
        })}
      </section>

      <section className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">Primera iteración</p>
        <h2 className="mt-2 text-lg font-bold text-zinc-900">Estructura administrativa activa</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Las listas ya consultan la base de datos. Los formularios y acciones del menú contextual se conectarán en la siguiente iteración del SDD.
        </p>
      </section>
    </div>
  )
}
