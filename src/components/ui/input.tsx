import { cn } from "@/lib/utils"
import { type InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-[var(--text-2)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-11 px-3.5 rounded-lg text-[14px] text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] placeholder:text-[var(--text-3)] transition-colors duration-150",
            "focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]",
            className
          )}
          style={{ touchAction: "manipulation", fontSize: "16px" }}
          {...props}
        />
        {error && <p className="text-[12px] text-[var(--error)]">{error}</p>}
        {hint && !error && <p className="text-[12px] text-[var(--text-3)]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
