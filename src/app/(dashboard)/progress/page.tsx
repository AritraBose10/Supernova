import { auth } from "../../../../auth"
import { prisma } from "@/lib/db"
import { TOPICS } from "@/lib/topics"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStreakLabel } from "@/lib/utils"
import { Flame, Mic2, TrendingUp, BookOpen } from "lucide-react"

export default async function ProgressPage() {
  const session = await auth()
  const userId = session?.user?.id!

  const [user, allSessions, progressData] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, name: true, level: true },
    }),
    prisma.conversationSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.progress.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 30,
    }),
  ])

  const avg = (key: "overall" | "grammar" | "vocabulary") =>
    progressData.length > 0
      ? Math.round(progressData.reduce((acc: number, p) => acc + p[key], 0) / progressData.length)
      : null

  const avgOverall = avg("overall")
  const avgGrammar = avg("grammar")
  const avgVocab = avg("vocabulary")

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--text)] tracking-tight">Progress</h1>
        <p className="text-[var(--text-2)] text-[13px] mt-0.5">Your improvement over time</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Flame,      value: user?.streak ?? 0,        label: "Streak",   accent: true, sub: getStreakLabel(user?.streak ?? 0) },
          { icon: Mic2,       value: allSessions.length,       label: "Sessions" },
          { icon: TrendingUp, value: avgOverall ?? "—",        label: "Avg Score" },
          { icon: BookOpen,   value: user?.level ?? "beginner",label: "Level",    cap: true },
        ].map(({ icon: Icon, value, label, accent, cap, sub }) => (
          <div key={label} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 flex flex-col items-center gap-1 shadow-sm">
            <Icon className={`w-4 h-4 ${accent ? "text-[var(--accent)]" : "text-[var(--text-3)]"}`} />
            <span className={`font-bold text-[var(--text)] leading-none tabular-nums ${cap ? "text-[10px] capitalize mt-0.5" : "text-[18px]"}`}>
              {value}
            </span>
            <span className="text-[10px] text-[var(--text-3)]">{label}</span>
            {sub && <span className="text-[9px] text-[var(--accent)]">{sub}</span>}
          </div>
        ))}
      </div>

      {progressData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <div className="space-y-4">
            {[
              { label: "Grammar",       value: avgGrammar ?? 0 },
              { label: "Vocabulary",    value: avgVocab ?? 0 },
              { label: "Pronunciation", value: avgGrammar && avgVocab ? Math.round((avgGrammar + avgVocab) / 2) : 0 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[var(--text-2)]">{label}</span>
                  <span className="font-semibold text-[var(--text)] tabular-nums">{value}/100</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-2 rounded-full bg-[var(--primary)] transition-all duration-700"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Session History</CardTitle></CardHeader>
        {allSessions.length === 0 ? (
          <p className="text-[var(--text-2)] text-[13px] text-center py-6">
            No sessions yet. Start practicing!
          </p>
        ) : (
          <div>
            {allSessions.map((s) => {
              const score = s.score as { overall?: number } | null
              const topic = TOPICS.find((t) => t.id === s.topic)
              const mins = Math.floor(s.durationSec / 60)
              const secs = s.durationSec % 60
              return (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[var(--primary)]" style={{ fontSize: 18 }}>{topic?.icon || "chat"}</span>
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text)]">{topic?.label || s.topic}</p>
                      <p className="text-[11px] text-[var(--text-3)]">
                        {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {mins}m {secs}s
                      </p>
                    </div>
                  </div>
                  {score?.overall != null && (
                    <Badge variant={score.overall >= 80 ? "success" : score.overall >= 60 ? "warning" : "error"}>
                      {score.overall}/100
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
