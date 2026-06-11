import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Supernova — Speak English Confidently",
  description: "Real conversations with an AI tutor. Get scored, track progress, and speak better English every day.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${montserrat.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
