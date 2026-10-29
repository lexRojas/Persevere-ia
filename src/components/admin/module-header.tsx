interface ModuleHeaderProps {
  eyebrow?: string
  title: string
  description: string
  count?: number
}

export function ModuleHeader({ eyebrow = 'Administración', title, description, count }: ModuleHeaderProps) {
  return (
    <header className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef3b23]">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      {typeof count === 'number' && (
        <span className="w-fit rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-600 shadow-sm">
          {count} {count === 1 ? 'registro' : 'registros'}
        </span>
      )}
    </header>
  )
}
