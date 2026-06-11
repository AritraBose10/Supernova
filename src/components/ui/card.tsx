import { cn } from "@/lib/utils"

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4",
        onClick && "cursor-pointer hover:border-[var(--border-2)] hover:shadow-sm transition-all duration-150",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn("text-[14px] font-semibold text-[var(--text)]", className)}>
      {children}
    </h3>
  )
}
