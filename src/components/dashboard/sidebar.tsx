"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/home",     label: "Home",     icon: "home",        iconActive: "home" },
  { href: "/practice", label: "Practice", icon: "chat_bubble", iconActive: "chat_bubble" },
  { href: "/progress", label: "Progress", icon: "leaderboard", iconActive: "leaderboard" },
  { href: "/settings", label: "Settings", icon: "settings",    iconActive: "settings" },
]

const PAGE_TITLES: Record<string, string> = {
  "/home":         "Home",
  "/practice":     "Practice",
  "/progress":     "Progress",
  "/settings":     "Settings",
  "/subscription": "Upgrade",
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const pageTitle = Object.entries(PAGE_TITLES).find(
    ([key]) => pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "Supernova"

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  return (
    <>
      {/* ── Mobile top navbar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <span className="text-[15px] font-semibold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
            {pageTitle}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/progress"
            aria-label="Progress"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>local_fire_department</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Account"
            className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--primary-bg)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--primary)]">
              {initials}
            </div>
          </button>
        </div>
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 flex-col bg-[var(--surface)] border-r border-[var(--border)] z-40">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <span className="text-[16px] font-semibold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
            Supernova
          </span>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto pt-3">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-100",
                  active
                    ? "bg-[var(--primary-bg)] text-[var(--primary)]"
                    : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                )}
              >
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{
                    fontSize: 18,
                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            )
          })}

          <Link
            href="/subscription"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-100 mt-1",
              pathname === "/subscription"
                ? "bg-[var(--primary-bg)] text-[var(--primary)]"
                : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            )}
          >
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 18 }}>
              workspace_premium
            </span>
            <span>Upgrade</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[var(--primary-bg)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--primary)] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-[var(--text)] truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-[11px] text-[var(--text-3)] truncate">
                {session?.user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--text-3)] hover:bg-[var(--surface-2)] hover:text-[var(--text-2)] transition-colors w-full cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--border)] flex items-stretch">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              style={{ touchAction: "manipulation" }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-100 min-h-[56px]",
                active ? "text-[var(--primary)]" : "text-[var(--text-3)]"
              )}
            >
              <div className={cn(
                "px-4 py-1 rounded-full transition-colors duration-100",
                active ? "bg-[var(--primary-bg)]" : ""
              )}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22, fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
              </div>
              <span className={cn("text-[10px] font-medium", active ? "font-semibold" : "")}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
