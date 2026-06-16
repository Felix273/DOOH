import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Menu | DOOH",
  description: "Navigate the DOOH platform.",
}

const links = [
  { label: "Product", href: "/product" },
  { label: "Network", href: "/network" },
  { label: "Pricing", href: "/pricing" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Browse Screens", href: "/screens" },
  { label: "Log in", href: "/login" },
  { label: "Get Started", href: "/register" },
]

export default function MenuPage() {
  return (
    <main className="menu-page">
      <div className="menu-panel">
        <Link href="/" className="brand-mark" aria-label="DOOH home">
          <span className="brand-icon" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
          DOOH<span style={{ color: "var(--accent)" }}>.</span>
        </Link>

        <div>
          <p className="t-label-accent" style={{ marginBottom: 10 }}>Navigation</p>
          <h1 className="menu-title">Where do you want to go?</h1>
        </div>

        <nav className="menu-links" aria-label="Site navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
