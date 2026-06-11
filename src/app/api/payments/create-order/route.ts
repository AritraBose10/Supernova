import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import Razorpay from "razorpay"

export const PLANS = {
  monthly: { amount: 49900, currency: "INR", label: "Pro Monthly", description: "Billed every month" },
  yearly: { amount: 399900, currency: "INR", label: "Pro Yearly", description: "Save 33% vs monthly" },
  lifetime: { amount: 999900, currency: "INR", label: "Lifetime Access", description: "Pay once, keep forever" },
} as const

export type PlanKey = keyof typeof PLANS

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { plan } = await req.json()
  const planDetails = PLANS[plan as PlanKey]
  if (!planDetails) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount: planDetails.amount,
    currency: planDetails.currency,
    notes: { userId: session.user.id, plan },
  })

  return NextResponse.json({ order, plan: planDetails })
}
