import type { NextConfig } from "next"

// NextAuth v5 reads AUTH_URL / NEXTAUTH_URL at module evaluation time.
// If either env var is absent or malformed (empty string, missing hostname,
// stray whitespace, etc.) the build fails with "TypeError: Invalid URL".
// This block runs before Turbopack evaluates any module, so it ensures a
// valid URL is always present. In production, Vercel's own env var wins
// (validated below); this fallback only activates when the value is absent
// or unparseable.
const FALLBACK_URL = "https://supernova-six-mauve.vercel.app"

function toValidUrl(raw: string | undefined): string {
  if (!raw) return FALLBACK_URL
  try {
    return new URL(raw.trim()).href
  } catch {
    return FALLBACK_URL
  }
}

const authUrl = toValidUrl(process.env.AUTH_URL ?? process.env.NEXTAUTH_URL)
process.env.AUTH_URL = authUrl
process.env.NEXTAUTH_URL = authUrl

const nextConfig: NextConfig = {}

export default nextConfig
