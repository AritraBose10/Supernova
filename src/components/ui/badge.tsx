import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "error" | "accent"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default:  "bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)]",
    success:  "bg-green-50 text-green-700 border-green-200",
    warning:  "bg-amber-50 text-amber-700 border-amber-200",
    error:    "bg-red-50 text-red-700 border-red-200",
    accent:   "bg-[var(--accent-bg)] text-[var(--accent)] border-amber-200",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
