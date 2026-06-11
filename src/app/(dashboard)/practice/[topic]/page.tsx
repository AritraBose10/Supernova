import { notFound } from "next/navigation"
import Link from "next/link"
import { TOPICS } from "@/lib/topics"
import { VoiceInterface } from "@/components/conversation/voice-interface"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ topic: string }>
}

export default async function TopicPracticePage({ params }: Props) {
  const { topic: topicId } = await params
  const topic = TOPICS.find((t) => t.id === topicId)
  if (!topic) notFound()

  return (
    <div className="flex flex-col -mt-6 -mx-4 lg:-mt-8 lg:-mx-6" style={{ height: "calc(100dvh - 56px)" }}>
      <div className="px-4 pt-3 pb-2 lg:px-5 lg:pt-4 flex-shrink-0">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All topics
        </Link>
      </div>
      <div className="flex-1 bg-[var(--surface)] border-t border-[var(--border)] overflow-hidden flex flex-col lg:mx-5 lg:mb-5 lg:rounded-xl lg:border">
        <VoiceInterface topicId={topicId} />
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }))
}
