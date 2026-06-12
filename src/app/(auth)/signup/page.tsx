"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push("/onboarding")
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/onboarding" })
  }

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5 pb-1">
        <div className="inline-flex w-10 h-10 rounded-xl bg-[var(--primary)] items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-base">S</span>
        </div>
        <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>Start speaking English</h1>
        <p className="text-[var(--text-2)] text-[13px]">Real conversations with an AI tutor — free to start</p>
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
          <Input id="name" label="Full Name" placeholder="Your name"
            value={form.name} onChange={(e) => update("name", e.target.value)} required autoComplete="name" />
          <Input id="email" label="Email" type="email" placeholder="you@example.com"
            value={form.email} onChange={(e) => update("email", e.target.value)} required autoComplete="email" />
          <Input id="password" label="Password" type="password" placeholder="Min. 8 characters"
            value={form.password} onChange={(e) => update("password", e.target.value)} required autoComplete="new-password" />
          <Button type="submit" variant="primary" size="lg" className="w-full mt-1" loading={loading}>
            Create Account
          </Button>
        </form>
      </div>

      <p className="text-center text-[13px] text-[var(--text-2)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--text)] font-medium underline underline-offset-2">
          Sign in
        </Link>
      </p>
      <p className="text-center text-[11px] text-[var(--text-3)]">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
      </p>
    </div>
  )
}
