import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { prisma } from "@/lib/db"
import crypto from "crypto"

const VALID_PLANS = ["monthly", "yearly", "lifetime"]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    let expiresAt: Date | null = null
    if (plan === "monthly") {
      expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    } else if (plan === "yearly") {
      expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    }

    const newPlan = plan === "lifetime" ? "lifetime" : "pro"

    await Promise.all([
      prisma.user.update({
        where: { id: session.user.id },
        data: { plan: newPlan },
      }),
      prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: {
          plan: newPlan,
          status: "active",
          razorpaySubscriptionId: razorpay_payment_id,
          expiresAt,
        },
        create: {
          userId: session.user.id,
          plan: newPlan,
          status: "active",
          razorpaySubscriptionId: razorpay_payment_id,
          expiresAt,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
