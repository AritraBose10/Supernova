import Groq from "groq-sdk"
import { TOPICS } from "./topics"

const groq = new Groq({ apiKey: process.env.GEMINI_API_KEY })

const MODEL = process.env.GEMINI_MODEL || "llama-3.3-70b-versatile"

type ChatMessage = { role: "user" | "assistant"; content: string }

export async function getAIResponse(
  history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  userMessage: string,
  topicId: string
): Promise<string> {
  const topic = TOPICS.find((t) => t.id === topicId) || TOPICS[2]

  const messages: ChatMessage[] = history.map((m) => ({
    role: m.role === "model" ? "assistant" : "user",
    content: m.parts[0]?.text || "",
  }))

  messages.push({ role: "user", content: userMessage })

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: topic.prompt }, ...messages],
    max_tokens: 150,
    temperature: 0.8,
  })

  return response.choices[0]?.message?.content || "Could you say that again?"
}

export async function evaluateSession(
  messages: Array<{ role: string; content: string }>
): Promise<{
  pronunciation: number
  grammar: number
  vocabulary: number
  overall: number
  feedback: string
}> {
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n")

  if (!userMessages.trim()) {
    return {
      pronunciation: 0,
      grammar: 0,
      vocabulary: 0,
      overall: 0,
      feedback: "No speech detected in this session.",
    }
  }

  const prompt = `Analyze this English speech from a language learner and respond ONLY with a JSON object (no markdown, no extra text):

Speech:
${userMessages}

Respond with exactly this JSON format:
{"grammar":75,"vocabulary":70,"overall":73,"feedback":"2-3 sentences of encouraging feedback with specific tips."}`

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    })

    const text = response.choices[0]?.message?.content?.trim() || ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] || text)
    const pronunciation = Math.round((parsed.grammar + parsed.vocabulary) / 2)

    return {
      pronunciation,
      grammar: Math.min(100, Math.max(0, parsed.grammar)),
      vocabulary: Math.min(100, Math.max(0, parsed.vocabulary)),
      overall: Math.min(100, Math.max(0, parsed.overall)),
      feedback: parsed.feedback,
    }
  } catch {
    return {
      pronunciation: 70,
      grammar: 70,
      vocabulary: 70,
      overall: 70,
      feedback: "Great effort! Keep practicing every day to improve your fluency.",
    }
  }
}
