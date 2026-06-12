"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const LEVELS = ["beginner", "intermediate", "advanced"] as const

const GOALS = [
  "Speak confidently in meetings",
  "Get a job abroad",
  "Pass IELTS / TOEFL",
  "Communicate with international clients",
  "Travel and explore the world",
  "Build everyday fluency",
  "Academic English for studies",
]

const CHALLENGES = [
  "Pronunciation & accent",
  "Grammar & sentence structure",
  "Vocabulary & word choice",
  "Speaking confidence",
  "Listening & understanding",
]

const CONTEXTS = [
  "Work meetings & presentations",
  "Travel & daily situations",
  "Social media & online",
  "University / academic writing",
  "Friends, family & social life",
]

const DAILY_TIMES = [
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour+", value: 60 },
]

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [level, setLevel] = useState("beginner")
  const [goal, setGoal] = useState("")
  const [challenge, setChallenge] = useState("")
  const [context, setContext] = useState("")
  const [dailyMin, setDailyMin] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) {
          setName(user.name || "")
          setLevel(user.level || "beginner")
          setGoal(user.goal || "")
          const meta = user.metadata as { challenge?: string; context?: string; dailyMin?: number } | null
          if (meta) {
            setChallenge(meta.challenge || "")
            setContext(meta.context || "")
            setDailyMin(meta.dailyMin ?? null)
          }
        }
      })
      .finally(() => setFetching(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        level,
        goal,
        metadata: { challenge, context, dailyMin },
      }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (fetching) {
    return (
      <div className="space-y-5 max-w-lg">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>Settings</h1>
        <p className="text-[var(--text-2)] text-[13px] mt-0.5">Update your profile and learning preferences anytime</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <form onSubmit={handleSave} className="space-y-5">
          <Input id="name" label="Display Name" value={name}
            onChange={(e) => setName(e.target.value)} placeholder="Your name" />

          <PickerSection label="Why I'm Learning English">
            {GOALS.map((g) => (
              <PickerChip key={g} label={g} selected={goal === g} onClick={() => setGoal(g)} />
            ))}
          </PickerSection>

          <PickerSection label="My Biggest Challenge">
            {CHALLENGES.map((c) => (
              <PickerChip key={c} label={c} selected={challenge === c} onClick={() => setChallenge(c)} />
            ))}
          </PickerSection>

          <PickerSection label="Where I Need English Most">
            {CONTEXTS.map((c) => (
              <PickerChip key={c} label={c} selected={context === c} onClick={() => setContext(c)} />
            ))}
          </PickerSection>

          <PickerSection label="Daily Practice Time">
            <div className="grid grid-cols-2 gap-2">
              {DAILY_TIMES.map((t) => (
                <button key={t.value} type="button" onClick={() => setDailyMin(t.value)}
                  style={{ touchAction: "manipulation", minHeight: 44 }}
                  className={`py-2 rounded-lg text-[13px] font-medium transition-colors border cursor-pointer ${
                    dailyMin === t.value
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-2)]"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </PickerSection>

          <PickerSection label="My English Level">
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button key={l} type="button" onClick={() => setLevel(l)}
                  style={{ touchAction: "manipulation", minHeight: 44 }}
                  className={`py-2 rounded-lg text-[13px] capitalize font-medium transition-colors border cursor-pointer ${
                    level === l
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-2)]"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </PickerSection>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

function PickerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-medium text-[var(--text-2)]">{label}</label>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function PickerChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ touchAction: "manipulation", minHeight: 44 }}
      className={`w-full py-2.5 px-3.5 rounded-lg text-[13px] text-left font-medium transition-colors border cursor-pointer ${
        selected
          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
          : "bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-2)]"
      }`}>
      {label}
    </button>
  )
}
