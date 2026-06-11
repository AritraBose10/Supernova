import { NextResponse } from "next/server"
import { auth } from "../../../../auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [progressData, user, totalSessions] = await Promise.all([
      prisma.progress.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "asc" },
        take: 30,
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { streak: true, plan: true, level: true, goal: true, name: true },
      }),
      prisma.conversationSession.count({
        where: { userId: session.user.id },
      }),
    ])

    return NextResponse.json({ progress: progressData, user, totalSessions })
  } catch {
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 })
  }
}
