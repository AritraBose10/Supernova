"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Square, Volume2, VolumeX } from "lucide-react"
import { cn, formatDuration } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TOPICS } from "@/lib/topics"
import Link from "next/link"

interface Message { role: "user" | "assistant"; content: string; timestamp: Date }
interface GeminiMessage { role: "user" | "model"; parts: Array<{ text: string }> }
interface ScoreResult { pronunciation: number; grammar: number; vocabulary: number; overall: number; feedback: string }
interface VoiceInterfaceProps { topicId: string; onSessionEnd?: (scores: ScoreResult) => void }

const TOPIC_INTROS: Record<string, string> = {
  "job-interview": "Hello! I'm Sarah from TechGlobal Solutions. Thanks for coming in today — we're excited to meet you. Let's start easy: could you tell me a little about yourself and your work experience so far?",
  "travel": "Hi there! Welcome to Terminal 2. Looks like you might be a little turned around — can I help you? Where are you headed today?",
  "daily-chat": "Hey! It's been a while. How have you been? I just grabbed a coffee — what have you been up to lately?",
  "business": "Good morning! Thanks for joining the call. Really looking forward to our chat today. Before we get into the agenda — how's everything going on your end?",
  "shopping": "Hi, welcome to StyleHub! Can I help you find something today? We just got some great new arrivals — is there something specific you're looking for?",
}

export function VoiceInterface({ topicId, onSessionEnd }: VoiceInterfaceProps) {
  const topic = TOPICS.find((t) => t.id === topicId) || TOPICS[2]

  const [messages, setMessages] = useState<Message[]>([])
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [scores, setScores] = useState<ScoreResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const pronunciationScoresRef = useRef<number[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, isTranscribing])

  const speak = useCallback((text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = "en-US"; u.rate = 0.95; u.pitch = 1
    u.onstart = () => setIsSpeaking(true)
    u.onend = () => setIsSpeaking(false)
    u.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [isMuted])

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }])
  }, [])

  const sendToAI = useCallback(async (userText: string) => {
    if (!userText.trim()) return
    setIsThinking(true); setError(null)
    const newHistory: GeminiMessage[] = [...geminiHistory, { role: "user", parts: [{ text: userText }] }]
    try {
      const res = await fetch("/api/conversation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: geminiHistory, topicId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to get AI response"); return }
      addMessage("assistant", data.response)
      setGeminiHistory([...newHistory, { role: "model", parts: [{ text: data.response }] }])
      speak(data.response)
    } catch { setError("Network error. Please try again.") }
    finally { setIsThinking(false) }
  }, [geminiHistory, topicId, addMessage, speak])

  const startSession = useCallback(async () => {
    setSessionActive(true)
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    const intro = TOPIC_INTROS[topicId] ?? `Hi! I'm your AI tutor for ${topic.label}. Hold the mic button and speak — I'll respond and help you improve. Let's begin!`
    addMessage("assistant", intro)
    setGeminiHistory([{ role: "model", parts: [{ text: intro }] }])
    speak(intro)
  }, [topicId, topic.label, addMessage, speak])

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing || isThinking || isSpeaking) return
    window.speechSynthesis?.cancel(); setIsSpeaking(false)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"

      const recorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        if (blob.size < 1000) return

        setIsTranscribing(true)
        try {
          const fd = new FormData()
          const ext = mimeType.includes("mp4") ? "mp4" : "webm"
          fd.append("audio", blob, `speech.${ext}`)
          const res = await fetch("/api/transcribe", { method: "POST", body: fd })
          const data = await res.json()

          if (!res.ok || !data.transcript?.trim()) {
            setError("Could not understand audio. Please try again.")
            return
          }

          addMessage("user", data.transcript.trim())
          if (typeof data.pronunciationScore === "number") {
            pronunciationScoresRef.current.push(data.pronunciationScore)
          }
          await sendToAI(data.transcript.trim())
        } catch {
          setError("Transcription failed. Please try again.")
        } finally {
          setIsTranscribing(false)
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      setError("Microphone access denied. Please allow microphone access and try again.")
    }
  }, [isRecording, isTranscribing, isThinking, isSpeaking, addMessage, sendToAI])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const endSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    window.speechSynthesis?.cancel()
    setIsRecording(false); setIsSpeaking(false); setSessionEnded(true); setIsSaving(true)

    const scores = pronunciationScoresRef.current
    const avgPronunciation = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : undefined

    try {
      const res = await fetch("/api/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          durationSec: duration,
          pronunciationScore: avgPronunciation,
          messages: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        }),
      })
      const data = await res.json()
      if (res.ok) { setScores(data.scores); onSessionEnd?.(data.scores) }
    } catch { setError("Failed to save session") }
    finally { setIsSaving(false) }
  }, [messages, topicId, duration, onSessionEnd])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaRecorderRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  if (sessionEnded && scores) {
    return (
      <div className="max-w-sm mx-auto text-center space-y-5 py-8 px-5">
        <div>
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-[20px] font-semibold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>Great session!</h2>
          <p className="text-[var(--text-2)] text-[13px] mt-0.5">{formatDuration(duration)} of speaking practice</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Grammar",       value: scores.grammar },
            { label: "Vocabulary",    value: scores.vocabulary },
            { label: "Pronunciation", value: scores.pronunciation },
            { label: "Overall",       value: scores.overall },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--surface-2)] rounded-xl p-3.5 border border-[var(--border)] text-left">
              <div className={cn("text-[26px] font-bold tabular-nums mb-0.5",
                value >= 80 ? "text-green-600" : value >= 60 ? "text-[var(--accent)]" : "text-[var(--error)]"
              )}>
                {value}
              </div>
              <div className="text-[11px] text-[var(--text-3)] uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)] text-left">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider mb-1.5">Tutor Feedback</p>
          <p className="text-[13px] text-[var(--text-2)] leading-relaxed">{scores.feedback}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="primary" size="lg" className="flex-1" onClick={() => {
            setMessages([]); setGeminiHistory([]); setSessionEnded(false)
            setScores(null); setDuration(0); setSessionActive(false)
            pronunciationScoresRef.current = []
          }}>
            Practice Again
          </Button>
          <Link href="/progress" className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">View Progress</Button>
          </Link>
        </div>
      </div>
    )
  }

  const busy = isThinking || isSpeaking || isSaving || isTranscribing

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-bg)] flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--primary)]" style={{ fontSize: 18 }}>{topic.icon}</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text)] leading-tight">{topic.label}</p>
            {sessionActive && (
              <p className="text-[11px] text-[var(--text-3)] tabular-nums">{formatDuration(duration)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setIsMuted(!isMuted); if (!isMuted) window.speechSynthesis?.cancel() }}
            style={{ touchAction: "manipulation", minWidth: 44, minHeight: 44 }}
            className="flex items-center justify-center rounded-lg text-[var(--text-3)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {sessionActive && (
            <Button variant="ghost" size="sm" onClick={endSession} className="text-[var(--text-2)] gap-1">
              <Square className="w-3 h-3" /> End
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-[var(--bg)]">
        {messages.length === 0 && !sessionActive && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2 max-w-[240px]">
              <span className="material-symbols-outlined text-[var(--primary)] mb-2 block" style={{ fontSize: 44, fontVariationSettings: "'FILL' 1" }}>{topic.icon}</span>
              <p className="text-[15px] font-semibold text-[var(--text)]">{topic.label}</p>
              <p className="text-[13px] text-[var(--text-2)] leading-relaxed">{topic.description}</p>
              <p className="text-[11px] text-[var(--text-3)] mt-3">Your AI tutor is ready — tap <strong>Start Session</strong> below</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5",
              msg.role === "user"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]"
            )}>
              {msg.role === "user" ? "Y" : "A"}
            </div>
            <div className={cn(
              "px-3 py-2 rounded-2xl text-[13px] leading-relaxed",
              msg.role === "user"
                ? "bg-[var(--primary)] text-white rounded-tr-sm"
                : "bg-[var(--surface)] text-[var(--text)] rounded-tl-sm border border-[var(--border)] shadow-sm"
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTranscribing && (
          <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse opacity-60">
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-[var(--primary)] text-white">Y</div>
            <div className="px-3 py-2 rounded-2xl text-[13px] bg-[var(--primary)]/50 text-white rounded-tr-sm italic flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
              Transcribing…
            </div>
          </div>
        )}

        {isThinking && (
          <div className="flex gap-2 max-w-[85%]">
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]">A</div>
            <div className="px-3 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] rounded-tl-sm shadow-sm">
              <div className="flex gap-1 items-center">
                {[0,1,2].map(i => (
                  <div key={i} className="bar w-1 h-3 rounded-full bg-[var(--text-3)]" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-[12px] text-[var(--error)] bg-red-50 rounded-lg px-3 py-2 inline-block border border-red-100">{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        {!sessionActive ? (
          <Button variant="primary" size="lg" className="w-full" onClick={startSession}>
            Start Session
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {isSpeaking && <p className="text-[11px] text-[var(--text-3)]">Tutor is speaking…</p>}
            {isTranscribing && !isSpeaking && <p className="text-[11px] text-[var(--text-3)]">Transcribing your speech…</p>}
            <div className="relative">
              <button
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                onPointerLeave={stopRecording}
                disabled={busy}
                style={{ touchAction: "manipulation", width: 64, height: 64 }}
                className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  isRecording
                    ? "bg-[var(--error)] scale-110 mic-ripple"
                    : "bg-[var(--accent)] hover:scale-105 active:scale-95"
                )}
              >
                {isRecording
                  ? <MicOff className="w-6 h-6 text-white" />
                  : <Mic className="w-6 h-6 text-white" />
                }
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-3)]">
              {isRecording ? "Release to send" : isThinking ? "Tutor is thinking…" : isTranscribing ? "Processing…" : "Hold to speak"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
