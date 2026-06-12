import type { Metadata } from "next"
import "./globals.css"
import ThemeToggle from "./components/ThemeToggle"

export const metadata: Metadata = {
  title: "DOOH Platform — Book Digital Billboard Advertising in Kenya",
  description: "Discover, book and manage digital out-of-home advertising campaigns across Kenya.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  )
}
