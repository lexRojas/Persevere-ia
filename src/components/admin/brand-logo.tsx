import { cn } from '@/lib/utils'

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-label="Persevere Academia de Música">
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full border-[5px] border-[#ef3b23] border-r-transparent" aria-hidden="true">
        <span className="absolute -bottom-1 -right-0.5 size-3.5 rounded-full bg-[#ef3b23]" />
        <span className="size-2 rounded-full bg-[#ef3b23]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-xl font-black tracking-[0.08em] text-zinc-800">PERSEVERE</span>
          <span className="mt-1 block text-[0.65rem] font-medium tracking-[0.18em] text-zinc-500">
            ACADEMIA DE MÚSICA
          </span>
        </span>
      )}
    </div>
  )
}
