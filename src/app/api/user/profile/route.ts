import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { prisma } from "@/lib/db"

const VALID_LEVELS = ["beginner", "intermediate", "advanced"]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        goal: true,
        metadata: true,
        image: true,
        streak: true,
        plan: true,
      },
    })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, level, goal, metadata } = await req.json()

    if (level && !VALID_LEVELS.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: String(name).trim().slice(0, 100) }),
        ...(level !== undefined && { level }),
        ...(goal !== undefined && { goal: String(goal).trim().slice(0, 200) }),
        ...(metadata !== undefined && { metadata }),
      },
      select: { id: true, name: true, email: true, level: true, goal: true, metadata: true, image: true },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
