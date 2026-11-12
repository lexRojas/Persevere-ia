import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-label="Persevere Academia de Música">
      <span className="grid size-11 shrink-0 place-items-center" aria-hidden="true">
        <Image src="/images/facito.svg" alt="" width={31} height={44} className="h-11 w-auto" priority />
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
