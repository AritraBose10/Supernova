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
  "Travel and get around easily",
  "Build everyday fluency",
  "Academic English for studies",
]

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [level, setLevel] = useState("beginner")
  const [goal, setGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) { setName(user.name || ""); setLevel(user.level || "beginner"); setGoal(user.goal || "") }
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
      body: JSON.stringify({ name, level, goal }),
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
          <Skeleton className="h-4 w-16" />
          {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>Settings</h1>
        <p className="text-[var(--text-2)] text-[13px] mt-0.5">Tell us about your goals so we can tailor your practice</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <Input id="name" label="Display Name" value={name}
            onChange={(e) => setName(e.target.value)} placeholder="Your name" />

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[var(--text-2)]">My English Level</label>
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
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[var(--text-2)]">Why I&apos;m Learning English</label>
            <div className="space-y-1.5">
              {GOALS.map((g) => (
                <button key={g} type="button" onClick={() => setGoal(g)}
                  style={{ touchAction: "manipulation", minHeight: 44 }}
                  className={`w-full py-2.5 px-3.5 rounded-lg text-[13px] text-left font-medium transition-colors border cursor-pointer ${
                    goal === g
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-2)]"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
