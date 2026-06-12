import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../auth"
import { prisma } from "@/lib/db"
import { evaluateSession } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { topicId, durationSec, messages, pronunciationScore } = await req.json()

    if (!topicId || typeof durationSec !== "number") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const convSession = await prisma.conversationSession.create({
      data: { userId: session.user.id, topic: topicId, durationSec },
    })

    if (messages?.length > 0) {
      await prisma.message.createMany({
        data: messages.map((m: { role: string; content: string }) => ({
          sessionId: convSession.id,
          role: m.role,
          content: m.content,
        })),
      })
    }

    const scores = await evaluateSession(messages || [], typeof pronunciationScore === "number" ? pronunciationScore : undefined)

    await prisma.conversationSession.update({
      where: { id: convSession.id },
      data: { score: scores },
    })

    await prisma.progress.create({
      data: {
        userId: session.user.id,
        sessionId: convSession.id,
        pronunciation: scores.pronunciation,
        grammar: scores.grammar,
        vocabulary: scores.vocabulary,
        overall: scores.overall,
      },
    })

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user) {
      const lastActive = user.lastActiveAt
      const now = new Date()
      const dayDiff = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      )
      let newStreak = user.streak
      if (dayDiff === 1) newStreak += 1
      else if (dayDiff > 1) newStreak = 1
      else if (dayDiff === 0) newStreak = Math.max(newStreak, 1)

      await prisma.user.update({
        where: { id: session.user.id },
        data: { streak: newStreak, lastActiveAt: now },
      })
    }

    return NextResponse.json({ session: convSession, scores })
  } catch {
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sessions = await prisma.conversationSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return NextResponse.json({ sessions })
  } catch {
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 })
  }
}
