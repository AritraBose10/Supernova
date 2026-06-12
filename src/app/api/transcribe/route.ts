import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../auth"
import Groq from "groq-sdk"
import { toFile } from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile || audioFile.size < 500) {
      return NextResponse.json({ error: "No audio" }, { status: 400 })
    }

    const ext = audioFile.type.includes("mp4") ? "mp4" : "webm"
    const file = await toFile(audioFile, `speech.${ext}`, { type: audioFile.type })

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      language: "en",
    })

    // avg_logprob per segment (0 = perfect, more negative = less clear)
    type Segment = { avg_logprob: number; no_speech_prob: number }
    const segments: Segment[] = (transcription as unknown as { segments?: Segment[] }).segments ?? []

    const speechSegments = segments.filter((s) => s.no_speech_prob < 0.5)
    const avgLogprob =
      speechSegments.length > 0
        ? speechSegments.reduce((sum, s) => sum + s.avg_logprob, 0) / speechSegments.length
        : -0.4

    // Map log-prob to 0-100: -1 → 0, 0 → 100
    const pronunciationScore = Math.min(100, Math.max(0, Math.round((avgLogprob + 1) * 100)))

    return NextResponse.json({
      transcript: transcription.text.trim(),
      pronunciationScore,
    })
  } catch (err) {
    console.error("Whisper error:", err)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}
