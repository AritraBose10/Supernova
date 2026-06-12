"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const GOALS = [
  { label: "Speak confidently in meetings", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { label: "Get a job abroad", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Pass IELTS / TOEFL", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" },
  { label: "Communicate with international clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { label: "Travel and explore the world", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Build everyday fluency", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { label: "Academic English for studies", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
]

const CHALLENGES = [
  { label: "Pronunciation & accent", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
  { label: "Grammar & sentence structure", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Vocabulary & word choice", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { label: "Speaking confidence", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Listening & understanding", icon: "M15.536 8.464a5 5 0 010 7.072M12 18.364A8.961 8.961 0 014 12c0-1.657.448-3.21 1.232-4.543M16.243 5.757A9 9 0 0121 12c0 1.944-.618 3.744-1.668 5.214" },
]

const CONTEXTS = [
  { label: "Work meetings & presentations", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Travel & daily situations", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Social media & online", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { label: "University / academic writing", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  { label: "Friends, family & social life", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
]

const DAILY_TIMES = [
  { label: "5 minutes", sub: "Quick daily habit", value: 5 },
  { label: "15 minutes", sub: "Steady progress", value: 15 },
  { label: "30 minutes", sub: "Serious learner", value: 30 },
  { label: "1 hour+", sub: "Full commitment", value: 60 },
]

const LEVELS = [
  { id: "beginner", label: "Beginner", desc: "I know some words and basic phrases", bars: 1 },
  { id: "intermediate", label: "Intermediate", desc: "I can have simple conversations", bars: 2 },
  { id: "advanced", label: "Advanced", desc: "I'm comfortable but want to polish", bars: 3 },
]

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState("")
  const [challenge, setChallenge] = useState("")
  const [context, setContext] = useState("")
  const [dailyMin, setDailyMin] = useState<number | null>(null)
  const [level, setLevel] = useState("")
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?.goal) router.replace("/home")
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [router])

  async function handleFinish() {
    if (!goal || !challenge || !context || !dailyMin || !level) return
    setSaving(true)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal,
        level,
        metadata: { challenge, context, dailyMin },
      }),
    })
    router.push("/home")
  }

  const canContinue = () => {
    if (step === 1) return !!goal
    if (step === 2) return !!challenge
    if (step === 3) return !!context
    if (step === 4) return dailyMin !== null
    if (step === 5) return !!level
    return false
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Logo + progress */}
      <div className="text-center space-y-4">
        <div className="inline-flex w-10 h-10 rounded-xl bg-[var(--primary)] items-center justify-center mx-auto">
          <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-montserrat)" }}>S</span>
        </div>
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: step === s ? 24 : 8,
                background: step > s ? "var(--primary)" : step === s ? "var(--primary)" : "var(--border)",
                opacity: step > s ? 0.4 : 1,
              }}
            />
          ))}
        </div>
        <p className="text-[11px] text-[var(--text-3)]">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Step 1: Goal */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
              Why are you learning English?
            </h1>
            <p className="text-[var(--text-2)] text-[13px]">Choose the goal that matters most to you</p>
          </div>
          <div className="space-y-2">
            {GOALS.map((g) => (
              <OptionButton key={g.label} label={g.label} icon={g.icon} selected={goal === g.label} onClick={() => setGoal(g.label)} />
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Biggest challenge */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
              What&apos;s your biggest challenge?
            </h1>
            <p className="text-[var(--text-2)] text-[13px]">We&apos;ll focus extra attention here</p>
          </div>
          <div className="space-y-2">
            {CHALLENGES.map((c) => (
              <OptionButton key={c.label} label={c.label} icon={c.icon} selected={challenge === c.label} onClick={() => setChallenge(c.label)} />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Context */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
              Where do you need English most?
            </h1>
            <p className="text-[var(--text-2)] text-[13px]">We&apos;ll pick the right scenarios for you</p>
          </div>
          <div className="space-y-2">
            {CONTEXTS.map((c) => (
              <OptionButton key={c.label} label={c.label} icon={c.icon} selected={context === c.label} onClick={() => setContext(c.label)} />
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Daily time */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
              How long can you practice daily?
            </h1>
            <p className="text-[var(--text-2)] text-[13px]">Even 5 minutes a day makes a real difference</p>
          </div>
          <div className="space-y-2">
            {DAILY_TIMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setDailyMin(t.value)}
                style={{ touchAction: "manipulation", minHeight: 60 }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all duration-150 border cursor-pointer ${
                  dailyMin === t.value
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <div>
                  <div className={`text-[15px] font-semibold ${dailyMin === t.value ? "text-white" : "text-[var(--text)]"}`}>{t.label}</div>
                  <div className={`text-[12px] mt-0.5 ${dailyMin === t.value ? "text-white/75" : "text-[var(--text-2)]"}`}>{t.sub}</div>
                </div>
                {dailyMin === t.value && (
                  <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Level */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
              What&apos;s your current level?
            </h1>
            <p className="text-[var(--text-2)] text-[13px]">We&apos;ll start you at exactly the right pace</p>
          </div>
          <div className="space-y-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                style={{ touchAction: "manipulation", minHeight: 72 }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-150 border cursor-pointer ${
                  level === l.id
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <div className="flex items-end gap-0.5 flex-shrink-0">
                  {[1, 2, 3].map((bar) => (
                    <div
                      key={bar}
                      className="w-1.5 rounded-sm"
                      style={{
                        height: bar === 1 ? 8 : bar === 2 ? 13 : 18,
                        background:
                          bar <= l.bars
                            ? level === l.id ? "rgba(255,255,255,0.9)" : "var(--primary)"
                            : level === l.id ? "rgba(255,255,255,0.3)" : "var(--border)",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <div className={`text-[15px] font-semibold capitalize ${level === l.id ? "text-white" : "text-[var(--text)]"}`}>{l.label}</div>
                  <div className={`text-[12px] mt-0.5 ${level === l.id ? "text-white/75" : "text-[var(--text-2)]"}`}>{l.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-2.5 pb-4">
        {step > 1 && (
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button
            variant="primary"
            size="lg"
            className={step > 1 ? "flex-[2]" : "w-full"}
            disabled={!canContinue()}
            onClick={() => setStep(step + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="flex-[2]"
            disabled={!canContinue()}
            loading={saving}
            onClick={handleFinish}
          >
            Let&apos;s go!
          </Button>
        )}
      </div>
    </div>
  )
}

function OptionButton({ label, icon, selected, onClick }: { label: string; icon: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ touchAction: "manipulation", minHeight: 52 }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-left font-medium transition-all duration-150 border cursor-pointer ${
        selected
          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
          : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)]"
      }`}
    >
      <svg className="w-4 h-4 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
    </button>
  )
}
