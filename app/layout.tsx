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
  metadataBase: new URL("https://dooh-bice.vercel.app"),
  title: {
    default: "DOOH Platform — Book Digital Billboard Advertising in Kenya",
    template: "%s | DOOH Platform",
  },
  description: "Discover, compare, and request bookings for digital out-of-home advertising screens across Kenya.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "DOOH Platform",
    title: "Book digital billboard advertising across Kenya",
    description: "Discover, compare, and request bookings for verified digital OOH inventory across Kenya.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "DOOH Platform — Digital OOH advertising in Kenya",
    description: "Discover and request bookings for digital screens across Kenya.",
  },
  robots: { index: true, follow: true },
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
