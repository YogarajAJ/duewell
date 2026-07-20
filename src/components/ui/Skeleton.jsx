import { cn } from '../../lib/cn'

/** Shimmering placeholder block — use instead of spinners for initial loads. */
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-ink-100',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_1.6s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className,
      )}
    />
  )
}

/** A skeleton shaped like a BillCard row. */
export function BillCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-4">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  )
}
