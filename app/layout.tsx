import type { Metadata } from "next"
import { Space_Grotesk, Space_Mono } from "next/font/google"
import "./globals.css"
import ThemeToggle from "./components/ThemeToggle"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "DOOH Platform — Book Digital Billboard Advertising in Kenya",
  description: "Discover, book and manage digital out-of-home advertising campaigns across Kenya.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.className} ${spaceGrotesk.variable} ${spaceMono.variable}`}
        suppressHydrationWarning
      >
        <ThemeToggle />
        {children}
      </body>
    </html>
  )
}
