import { prisma } from "@/lib/db"
import { TOPICS } from "@/lib/topics"
import Link from "next/link"

export default async function HomePage() {
  const { auth } = await import("../../../../auth")
  const session = await auth()
  const userId = session?.user?.id

  const [user, recentSessions, totalSessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId! },
      select: { name: true, streak: true, plan: true, level: true },
    }),
    prisma.conversationSession.findMany({
      where: { userId: userId! },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.conversationSession.count({ where: { userId: userId! } }),
  ])

  const avgScore =
    recentSessions.length > 0
      ? Math.round(
          recentSessions.reduce((sum: number, s) => {
            const score = s.score as { overall?: number } | null
            return sum + (score?.overall || 0)
          }, 0) / recentSessions.length
        )
      : null

  const firstName = user?.name?.split(" ")[0] || "there"
  const streak = user?.streak ?? 0

  const recentScores = recentSessions.map(s => {
    const score = s.score as { overall?: number } | null
    return score?.overall || 0
  })

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <section>
        <h2 className="text-[24px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
          Hi, {firstName}!
        </h2>
        <p className="text-[var(--text-2)] text-[14px] mt-0.5">Ready to practice today?</p>
      </section>

      {/* Streak banner */}
      {streak > 0 && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4648d4 0%, #6366f1 100%)" }}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white opacity-10 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 z-10">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
            <div>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-wider">Current Streak</p>
              <p className="text-white text-[20px] font-bold" style={{ fontFamily: "var(--font-montserrat)" }}>
                {streak} {streak === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
          <Link
            href="/progress"
            className="z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>chevron_right</span>
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <section>
        <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2.5 pl-0.5">Your Progress</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3.5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-bg)] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[var(--primary)]" style={{ fontSize: 18 }}>record_voice_over</span>
            </div>
            <div className="text-[22px] font-bold text-[var(--text)] tabular-nums" style={{ fontFamily: "var(--font-montserrat)" }}>
              {totalSessions}
            </div>
            <div className="text-[11px] text-[var(--text-3)] mt-0.5">Sessions</div>
          </div>

          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3.5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[var(--secondary-bg)] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[var(--secondary)]" style={{ fontSize: 18 }}>trending_up</span>
            </div>
            <div className="text-[22px] font-bold text-[var(--text)] tabular-nums" style={{ fontFamily: "var(--font-montserrat)" }}>
              {avgScore !== null ? `${avgScore}%` : "—"}
            </div>
            <div className="text-[11px] text-[var(--text-3)] mt-0.5">Avg Score</div>
          </div>

          {/* Wide stat card */}
          <div className="col-span-2 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(185,5,56,0.10)] flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--tertiary)", fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-3)]">Streak</p>
                <p className="text-[20px] font-bold text-[var(--text)] tabular-nums" style={{ fontFamily: "var(--font-montserrat)" }}>
                  {streak} {streak === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
            {/* Mini score bars */}
            {recentScores.length > 0 && (
              <div className="flex items-end gap-1 h-10">
                {[...Array(5)].map((_, i) => {
                  const score = recentScores[recentScores.length - 1 - i] ?? null
                  const h = score != null ? Math.max(20, score) : 30
                  return (
                    <div
                      key={i}
                      className="w-2 rounded-t-sm"
                      style={{
                        height: `${h * 0.4}px`,
                        maxHeight: 40,
                        background: i === 0 ? "var(--tertiary)" : "var(--surface-3)",
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Start: topic horizontal scroll */}
      <section className="-mx-4">
        <div className="flex items-center justify-between px-4 mb-2.5">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Start Practicing</p>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-4 snap-x">
          {TOPICS.map(topic => (
            <Link
              key={topic.id}
              href={`/practice/${topic.id}`}
              className="snap-start shrink-0 w-[160px] bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3.5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--primary-bg)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--primary)]" style={{ fontSize: 18 }}>
                  {topic.icon}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--text)] leading-tight">{topic.label}</p>
                <p className="text-[11px] text-[var(--text-3)] mt-0.5 line-clamp-2 leading-tight">{topic.description}</p>
              </div>
              <div className="mt-auto pt-1">
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)]">
                  <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Start
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent sessions */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Recent Sessions</p>
        </div>
        {recentSessions.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 text-center">
            <span className="material-symbols-outlined text-[var(--text-3)] block mb-2" style={{ fontSize: 32 }}>chat_bubble</span>
            <p className="text-[13px] text-[var(--text-2)]">No sessions yet. Start practicing!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentSessions.map((s) => {
              const score = s.score as { overall?: number } | null
              const topic = TOPICS.find((t) => t.id === s.topic)
              const mins = Math.floor(s.durationSec / 60)
              const secs = s.durationSec % 60
              const overall = score?.overall
              return (
                <div
                  key={s.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-3 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--primary-bg)] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[var(--primary)]" style={{ fontSize: 20 }}>
                      {topic?.icon || "chat"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--text)] truncate">{topic?.label || s.topic}</p>
                    <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {mins}m {secs}s
                    </p>
                  </div>
                  {overall != null && (
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`text-[15px] font-bold tabular-nums ${overall >= 80 ? "text-[var(--secondary)]" : overall >= 60 ? "text-[var(--primary)]" : "text-[var(--error)]"}`}>
                        {overall}%
                      </span>
                      <div className="w-12 h-1.5 bg-[var(--surface-2)] rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${overall}%`, background: overall >= 80 ? "var(--secondary)" : overall >= 60 ? "var(--primary)" : "var(--error)" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <Link
              href="/progress"
              className="mt-1 w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-2)] text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-[var(--surface-2)] transition-colors"
            >
              View All History
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
