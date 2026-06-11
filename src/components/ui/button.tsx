import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] touch-action-manipulation"

    const variants = {
      primary:
        "bg-[var(--primary)] hover:bg-[var(--primary-dk)] text-white font-semibold",
      secondary:
        "bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-2)]",
      ghost:
        "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]",
      danger:
        "bg-[var(--error)]/8 hover:bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/25",
      outline:
        "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white",
    }

    const sizes = {
      sm: "h-8 px-3 text-[13px] min-w-[44px]",
      md: "h-9 px-4 text-[13px] min-w-[44px]",
      lg: "h-11 px-5 text-[14px] min-w-[44px]",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        style={{ touchAction: "manipulation" }}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
