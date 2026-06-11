import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      {/* pt-14 on mobile for top navbar, pb-20 for bottom tab bar */}
      <main className="flex-1 lg:ml-56 min-h-screen overflow-auto pt-14 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-5 lg:px-6 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
