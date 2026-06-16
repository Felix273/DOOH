import type { ReactNode } from "react"
import Link from "next/link"

const navLinks = [
  { label: "Product", href: "/product" },
  { label: "Network", href: "/network" },
  { label: "Pricing", href: "/pricing" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "About", href: "/about" },
]

type MarketingPageProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export function MarketingPage({
  eyebrow,
  title,
  description,
  children,
  primaryCta = { label: "Start a Campaign", href: "/register" },
  secondaryCta = { label: "Explore Screens", href: "/screens" },
}: MarketingPageProps) {
  return (
    <main className="marketing-page">
      <nav className="nav">
        <div className="nav-inner">
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

          <div className="marketing-nav-links">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="marketing-actions">
            <Link href="/login" className="btn btn-secondary btn-sm">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>

          <Link
            href="/menu"
            className="mobile-nav-link"
            aria-label="Open navigation menu"
          >
            Menu
            <span aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </Link>
        </div>
      </nav>

      <section className="marketing-hero">
        <div className="container">
          <p className="t-label-accent">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="marketing-hero-actions">
            <Link href={primaryCta.href} className="btn btn-primary btn-lg">
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} className="btn btn-secondary btn-lg">
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {children}

      <section className="marketing-final-cta">
        <div className="container">
          <p className="t-label-accent">Ready to move?</p>
          <h2>Plan your next DOOH campaign on a live marketplace.</h2>
          <div>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Account
            </Link>
            <Link href="/screens" className="btn btn-secondary btn-lg">
              Browse Inventory
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export function MarketingSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="marketing-section">
      <div className="container">
        <div className="marketing-section-header">
          {eyebrow ? <p className="t-label-accent">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p className="t-body">{description}</p> : null}
        </div>
        {children}
      </div>
    </section>
  )
}
