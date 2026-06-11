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

type SpeechRecognitionType = {
  lang: string; interimResults: boolean; maxAlternatives: number
  onresult: (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void
  onerror: (e: { error: string }) => void; onend: () => void
  start: () => void; stop: () => void; abort: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType
    webkitSpeechRecognition: new () => SpeechRecognitionType
  }
}

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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [scores, setScores] = useState<ScoreResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interimText, setInterimText] = useState("")
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSupported(false); return }
    const r = new SR()
    r.lang = "en-US"; r.interimResults = true; r.maxAlternatives = 1
    recognitionRef.current = r
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, interimText])

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

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || isRecording || isThinking || isSpeaking) return
    window.speechSynthesis.cancel(); setIsSpeaking(false)
    const r = recognitionRef.current
    setInterimText("")
    r.onresult = (event) => {
      let final = "", interim = ""
      for (let i = 0; i < Object.keys(event.results).length; i++) {
        const res = event.results[i]
        if (res[0]) {
          if (i === Object.keys(event.results).length - 1) interim = res[0].transcript
          else final += res[0].transcript + " "
        }
      }
      setInterimText(interim)
      if (final) { setInterimText(""); addMessage("user", final.trim()); sendToAI(final.trim()) }
    }
    r.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") setError(`Speech error: ${e.error}`)
      setIsRecording(false); setInterimText("")
    }
    r.onend = () => {
      setIsRecording(false)
      const t = interimText.trim()
      if (t) { setInterimText(""); addMessage("user", t); sendToAI(t) }
    }
    r.start(); setIsRecording(true)
  }, [isRecording, isThinking, isSpeaking, interimText, addMessage, sendToAI])

  const stopRecording = useCallback(() => { recognitionRef.current?.stop(); setIsRecording(false) }, [])

  const endSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    recognitionRef.current?.abort(); window.speechSynthesis.cancel()
    setIsRecording(false); setIsSpeaking(false); setSessionEnded(true); setIsSaving(true)
    try {
      const res = await fetch("/api/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, durationSec: duration, messages: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })) }),
      })
      const data = await res.json()
      if (res.ok) { setScores(data.scores); onSessionEnd?.(data.scores) }
    } catch { setError("Failed to save session") }
    finally { setIsSaving(false) }
  }, [messages, topicId, duration, onSessionEnd])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      recognitionRef.current?.abort(); window.speechSynthesis.cancel()
    }
  }, [])

  if (!supported) {
    return (
      <div className="flex items-center justify-center h-full px-6 text-center">
        <div>
          <p className="text-[var(--text-2)] text-[13px] font-medium">Speech recognition not supported</p>
          <p className="text-[12px] text-[var(--text-3)] mt-1">Please open this app in Chrome or Edge to use the microphone.</p>
        </div>
      </div>
    )
  }

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
            onClick={() => { setIsMuted(!isMuted); if (!isMuted) window.speechSynthesis.cancel() }}
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

        {interimText && (
          <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse opacity-50">
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-[var(--primary)] text-white">Y</div>
            <div className="px-3 py-2 rounded-2xl text-[13px] bg-[var(--primary)]/60 text-white rounded-tr-sm italic">{interimText}</div>
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
            <div className="relative">
              <button
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                onPointerLeave={stopRecording}
                disabled={isThinking || isSpeaking || isSaving}
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
              {isRecording ? "Release to send" : isThinking ? "Tutor is thinking…" : "Hold to speak"}
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
