"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center max-w-xs">
        <span className="material-symbols-outlined text-[var(--error)] block mb-4" style={{ fontSize: 48 }}>
          error_outline
        </span>
        <h2 className="text-[20px] font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
          Something went wrong
        </h2>
        <p className="text-[var(--text-2)] text-[13px] mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white cursor-pointer"
          style={{ background: "var(--primary)" }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
