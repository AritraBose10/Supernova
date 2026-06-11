import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../auth"
import { getAIResponse } from "@/lib/gemini"

const FREE_DAILY_LIMIT = 3

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { message, history, topicId } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const { prisma } = await import("@/lib/db")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })

  if (user?.plan === "free") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessionsToday = await prisma.conversationSession.count({
      where: { userId: session.user.id, createdAt: { gte: today } },
    })
    if (sessionsToday >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily session limit reached. Upgrade to Pro for unlimited sessions." },
        { status: 429 }
      )
    }
  }

  try {
    const aiResponse = await getAIResponse(history || [], message, topicId)
    return NextResponse.json({ response: aiResponse })
  } catch (err) {
    console.error("Gemini error:", err)
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 })
  }
}
