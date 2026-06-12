export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 flex justify-center">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  )
}
