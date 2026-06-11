import Link from "next/link"

export const metadata = { title: "Terms of Service — Supernova AI" }

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-2)] mb-8 hover:text-[var(--text)]">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        Back
      </Link>

      <h1 className="text-[28px] font-bold text-[var(--text)] mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>Terms of Service</h1>
      <p className="text-[var(--text-3)] text-[13px] mb-8">Last updated: June 2025</p>

      <div className="space-y-6 text-[14px] text-[var(--text-2)] leading-relaxed">
        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">1. Acceptance</h2>
          <p>By creating an account or using Supernova AI, you agree to these Terms. If you do not agree, do not use the service.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">2. Service Description</h2>
          <p>Supernova AI provides AI-powered spoken English practice. The service uses AI language models to simulate conversations and provide feedback. It is not a substitute for professional language instruction.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">3. Free and Paid Plans</h2>
          <p>Free accounts are limited to 3 practice sessions per day. Pro and Lifetime plans unlock unlimited sessions. Subscription fees are non-refundable except as required by law.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">4. Acceptable Use</h2>
          <p>You agree not to use the service to generate harmful, offensive, or illegal content. Automated access, scraping, or attempts to reverse-engineer the service are prohibited.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">5. Disclaimers</h2>
          <p>The service is provided &quot;as is&quot; without warranties of any kind. AI-generated feedback may contain errors. We are not liable for any decisions made based on the app&apos;s scores or feedback.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">6. Changes</h2>
          <p>We reserve the right to modify these terms or the service at any time. Continued use after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2">7. Contact</h2>
          <p>Questions? Email <a href="mailto:support@supernovaai.in" className="text-[var(--primary)] underline">support@supernovaai.in</a>.</p>
        </section>
      </div>
    </div>
  )
}
