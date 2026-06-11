"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => { open: () => void }
  }
}

interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string; description: string;
  order_id: string; handler: (r: RazorpayResponse) => void; prefill?: { name?: string; email?: string }; theme?: { color?: string }
}
interface RazorpayResponse { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }

const PLANS = [
  { key: "monthly",  label: "Monthly",  price: "₹499",   period: "/mo",    badge: null,           highlight: false,
    features: ["Unlimited sessions every day", "All 5 practice topics", "Detailed score breakdown", "Full session history"] },
  { key: "yearly",   label: "Yearly",   price: "₹3,999", period: "/yr",    badge: "Best value",   highlight: true,
    features: ["Everything in Monthly", "Save ₹1,989 vs monthly", "Access to all future topics", "Priority support"] },
  { key: "lifetime", label: "Lifetime", price: "₹9,999", period: "once",   badge: null,           highlight: false,
    features: ["Everything in Pro, forever", "One-time payment, no renewals", "All future features included", "Early access to new topics"] },
]

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("free")
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/user/profile").then(r => r.json())
      .then(({ user }) => { if (user?.plan) setCurrentPlan(user.plan) })
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => {
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  async function handlePurchase(planKey: string) {
    setLoading(planKey)
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      })
      const { order } = await res.json()
      new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount, currency: order.currency,
        name: "Supernova", description: `${planKey} plan`, order_id: order.id,
        handler: async (r) => {
          const v = await fetch("/api/payments/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...r, plan: planKey }),
          })
          if (v.ok) { setSuccess(true); setCurrentPlan(planKey === "lifetime" ? "lifetime" : "pro") }
        },
        theme: { color: "#1C1917" },
      }).open()
    } catch (e) { console.error(e) } finally { setLoading(null) }
  }

  if (fetching) {
    return (
      <div className="space-y-5 max-w-lg mx-auto">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-52" />
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3">
            <div className="flex justify-between"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-16" /></div>
            {[1,2,3,4].map(j => <Skeleton key={j} className="h-4 w-full" />)}
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--text)]" style={{ fontFamily: "var(--font-montserrat)" }}>You&apos;re all set!</h2>
          <p className="text-[var(--text-2)] text-[13px] mt-1">Unlimited practice sessions unlocked. Now go speak!</p>
        </div>
        <Link href="/practice"><Button variant="primary" size="lg">Start Practicing</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>Go Pro</h1>
        <p className="text-[var(--text-2)] text-[13px] mt-0.5">
          Free plan: 3 sessions/day. Pro: unlimited — practice as much as you want.
        </p>
        {currentPlan !== "free" && <Badge variant="success" className="mt-2">Current: {currentPlan}</Badge>}
      </div>

      <div className="space-y-2.5">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`bg-[var(--surface)] rounded-xl border p-4 shadow-sm ${
              plan.highlight ? "border-[var(--primary)] ring-1 ring-[var(--primary)]/10" : "border-[var(--border)]"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[var(--text)]">{plan.label}</span>
                  {plan.badge && <Badge variant="accent">{plan.badge}</Badge>}
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[20px] font-bold text-[var(--text)] tabular-nums">{plan.price}</span>
                  <span className="text-[12px] text-[var(--text-3)]">{plan.period}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-1.5 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13px]">
                  <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span className="text-[var(--text-2)]">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlight ? "primary" : "secondary"}
              size="lg"
              className="w-full"
              loading={loading === plan.key}
              disabled={currentPlan === "lifetime" || (currentPlan === "pro" && plan.key === "monthly")}
              onClick={() => handlePurchase(plan.key)}
            >
              {currentPlan === "lifetime" ? "Owned" : currentPlan === "pro" && plan.key === "monthly" ? "Current plan" : "Get started"}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-[12px] text-[var(--text-3)]">
        Secured by Razorpay · Cancel anytime
      </p>
    </div>
  )
}
