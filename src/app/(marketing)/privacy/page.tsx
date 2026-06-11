import Link from "next/link"

export const metadata = { title: "Privacy Policy — Supernova AI" }

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-2)] mb-8 hover:text-[var(--text)]">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        Back
      </Link>

      <h1 className="text-[28px] font-bold text-[var(--text)] mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>Privacy Policy</h1>
      <p className="text-[var(--text-3)] text-[13px] mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm max-w-none space-y-6 text-[14px] text-[var(--text-2)] leading-relaxed">
        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">1. Information We Collect</h2>
          <p>When you create an account, we collect your name and email address. When you practice with the app, we store your conversation transcripts, session duration, and scores. If you sign in with Google, we receive your name, email, and profile picture from Google.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">2. How We Use Your Information</h2>
          <p>We use your data to: provide the AI tutoring service, calculate your scores and track progress, maintain your streak and learning history, and process subscription payments via Razorpay.</p>
          <p className="mt-2">We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">3. AI Conversations</h2>
          <p>Your voice input is processed by your browser&apos;s built-in speech recognition (Web Speech API) and never sent to our servers as audio. The text transcript is sent to our AI provider (Groq) solely to generate a response and is not used to train AI models.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">4. Payments</h2>
          <p>Payment processing is handled by Razorpay. We do not store your card details. Razorpay&apos;s privacy policy applies to all payment transactions.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">5. Data Retention</h2>
          <p>Your account and session data are retained as long as your account is active. You may request deletion of your account and all associated data by emailing us.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">6. Security</h2>
          <p>Your data is stored on Neon PostgreSQL with TLS encryption in transit. Passwords are hashed using bcrypt and never stored in plain text.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">7. Contact</h2>
          <p>For privacy questions or data deletion requests, contact us at <a href="mailto:support@supernovaai.in" className="text-[var(--primary)] underline">support@supernovaai.in</a>.</p>
        </section>
      </div>
    </div>
  )
}
