import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg bg-[var(--surface-2)] animate-pulse", className)} />
  )
}
