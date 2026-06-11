import Link from "next/link"
import { TOPICS } from "@/lib/topics"

const ACCENT_COLORS = [
  { icon: "bg-[var(--primary-bg)]", text: "text-[var(--primary)]", corner: "bg-[var(--primary)]" },
  { icon: "bg-[var(--secondary-bg)]", text: "text-[var(--secondary)]", corner: "bg-[var(--secondary)]" },
  { icon: "bg-[rgba(185,5,56,0.10)]", text: "text-[var(--tertiary)]", corner: "bg-[var(--tertiary)]" },
  { icon: "bg-[var(--primary-bg)]", text: "text-[var(--primary)]", corner: "bg-[var(--primary)]" },
  { icon: "bg-[var(--secondary-bg)]", text: "text-[var(--secondary)]", corner: "bg-[var(--secondary)]" },
]

export default function PracticePage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-bg)] mb-2">
          <span className="material-symbols-outlined text-[var(--primary)]" style={{ fontSize: 14 }}>record_voice_over</span>
          <span className="text-[11px] font-semibold text-[var(--primary)] uppercase tracking-widest">Speaking Hub</span>
        </div>
        <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
          Choose a Topic
        </h1>
        <p className="text-[var(--text-2)] text-[14px] mt-1 max-w-sm">
          Select a scenario to start your interactive conversation with your AI tutor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOPICS.map((topic, i) => {
          const color = ACCENT_COLORS[i % ACCENT_COLORS.length]
          const isLastOdd = i === TOPICS.length - 1 && TOPICS.length % 2 !== 0
          return (
            <article
              key={topic.id}
              className={`bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${isLastOdd ? "sm:col-span-2 sm:max-w-sm sm:justify-self-center sm:w-full" : ""}`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 ${color.corner} transition-transform group-hover:scale-110 origin-top-right`} />

              <div className="flex items-start gap-3 z-10">
                <div className={`w-11 h-11 rounded-full ${color.icon} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined ${color.text}`} style={{ fontSize: 22 }}>
                    {topic.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-[var(--text)] leading-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
                    {topic.label}
                  </h3>
                  <p className="text-[13px] text-[var(--text-2)] mt-1 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>

              <Link
                href={`/practice/${topic.id}`}
                className="mt-auto self-start z-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)" }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Start
              </Link>
            </article>
          )
        })}
      </div>

      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 shadow-sm">
        <p className="text-[13px] font-semibold text-[var(--text)] mb-3">How it works</p>
        <div className="space-y-3">
          {[
            { icon: "touch_app", text: "Pick a topic above" },
            { icon: "mic",       text: "Hold the mic and speak in English" },
            { icon: "grade",     text: "Get an instant score and feedback" },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[var(--primary-bg)] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[var(--primary)]" style={{ fontSize: 14 }}>{icon}</span>
              </div>
              <p className="text-[13px] text-[var(--text-2)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
