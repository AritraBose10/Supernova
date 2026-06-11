import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center max-w-xs">
        <span className="material-symbols-outlined text-[var(--border-2)] block mb-4" style={{ fontSize: 56 }}>
          search_off
        </span>
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
          Page not found
        </h1>
        <p className="text-[var(--text-2)] text-[14px] mb-6">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
