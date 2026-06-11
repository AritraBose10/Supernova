"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const RAYS = [
  { angle: 0,   height: 104, delay: 280 },
  { angle: 45,  height: 82,  delay: 320 },
  { angle: 90,  height: 108, delay: 295 },
  { angle: 135, height: 86,  delay: 340 },
  { angle: 180, height: 102, delay: 285 },
  { angle: 225, height: 80,  delay: 315 },
  { angle: 270, height: 112, delay: 300 },
  { angle: 315, height: 84,  delay: 330 },
]

function SupernovaLoader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2650)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="sn-loader"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#f8f9fa",
        animation: "sn-overlay-out 0.45s ease-in-out 2.2s both",
      }}
    >
      {/* Burst — all children positioned relative to 0×0 center point */}
      <div style={{ position: "relative", width: 0, height: 0 }}>

        {/* Expanding rings */}
        {[
          { size: 52, delay: 290, dur: "0.85s", opacity: 0.7 },
          { size: 52, delay: 440, dur: "1.05s", opacity: 0.45 },
          { size: 52, delay: 600, dur: "0.95s", opacity: 0.3 },
        ].map((ring, i) => (
          <div key={i} style={{
            position: "absolute",
            width: ring.size, height: ring.size,
            borderRadius: "50%",
            border: `${i === 0 ? 2 : 1.5}px solid rgba(70,72,212,${ring.opacity})`,
            left: -(ring.size / 2), top: -(ring.size / 2),
            animation: `sn-ring-expand ${ring.dur} cubic-bezier(0.2,0.8,0.3,1) ${ring.delay}ms both`,
          }} />
        ))}

        {/* Rays — rotated wrapper keeps scaleY animating outward for any angle */}
        {RAYS.map((ray) => (
          <div key={ray.angle} style={{
            position: "absolute",
            width: 0, height: 0,
            top: 0, left: 0,
            transform: `rotate(${ray.angle}deg)`,
          }}>
            <div style={{
              position: "absolute",
              width: 2, height: ray.height,
              left: -1, bottom: 0,
              transformOrigin: "bottom center",
              borderRadius: 2,
              background: "linear-gradient(to top, rgba(70,72,212,0.95) 0%, rgba(99,102,241,0.55) 52%, transparent 100%)",
              animation: `sn-ray-grow 1s cubic-bezier(0.1,0.9,0.2,1) ${ray.delay}ms both`,
            }} />
          </div>
        ))}

        {/* Core — the star that explodes outward */}
        <div style={{
          position: "absolute",
          width: 52, height: 52,
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 38%, #6366f1, #4648d4 58%, #2f2ebe)",
          left: -26, top: -26,
          animation: "sn-core 1.3s cubic-bezier(0.4,0,0.6,1) 0ms both",
        }} />

        {/* Logo — materialises from the nova with a spring bounce */}
        <div style={{
          position: "absolute",
          width: 56, height: 56,
          borderRadius: 16,
          background: "linear-gradient(135deg, #5254e0 0%, #4648d4 58%, #2f2ebe 100%)",
          left: -28, top: -28,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "sn-logo-reveal 0.85s cubic-bezier(0.34,1.56,0.64,1) 870ms both, sn-logo-glow 2s ease-in-out 1.7s infinite",
        }}>
          <span style={{
            fontFamily: "var(--font-montserrat, system-ui, sans-serif)",
            fontSize: 24, fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}>S</span>
        </div>
      </div>

      {/* Wordmark — appears beneath the logo */}
      <div style={{
        position: "absolute",
        top: "calc(50% + 54px)",
        left: 0, right: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 5,
      }}>
        <p style={{
          fontFamily: "var(--font-montserrat, system-ui, sans-serif)",
          fontSize: 13, fontWeight: 700,
          letterSpacing: "0.22em",
          color: "#4648d4",
          textTransform: "uppercase",
          opacity: 0,
          animation: "sn-wordmark 0.45s ease-out 1.38s forwards",
        }}>
          Supernova AI
        </p>
        <p style={{
          fontSize: 11,
          color: "#767586",
          letterSpacing: "0.04em",
          opacity: 0,
          animation: "sn-tagline 0.45s ease-out 1.62s forwards",
        }}>
          Speak English. Confidently.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [showLoader, setShowLoader] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const hideLoader = useCallback(() => setShowLoader(false), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/home")
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/home" })
  }

  return (
    <>
      {showLoader && <SupernovaLoader onDone={hideLoader} />}

      <div className="space-y-5">
        <div className="text-center space-y-1.5 pb-1">
          <div className="inline-flex w-10 h-10 rounded-xl bg-[var(--primary)] items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-base">S</span>
          </div>
          <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>Welcome back</h1>
          <p className="text-[var(--text-2)] text-[13px]">Your AI English tutor is waiting</p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 space-y-4 shadow-sm">
          <Button variant="secondary" size="lg" className="w-full" loading={googleLoading} onClick={handleGoogle}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[11px] text-[var(--text-3)] uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="text-[13px] text-[var(--error)] bg-red-50 rounded-lg px-3 py-2.5 border border-red-100">
                {error}
              </div>
            )}
            <Input id="email" label="Email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input id="password" label="Password" type="password" placeholder="Your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <Button type="submit" variant="primary" size="lg" className="w-full mt-1" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[var(--text-2)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--text)] font-medium underline underline-offset-2">
            Sign up free
          </Link>
        </p>
      </div>
    </>
  )
}
