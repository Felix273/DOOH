"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AppShellProps = {
  eyebrow: string
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function AppShell({ eyebrow, title, description, children, actions }: AppShellProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="app-page">
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        <div className="app-topbar">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary)", textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="6" height="4" rx="1" fill="#080808"/>
                <rect x="9" y="1" width="6" height="4" rx="1" fill="#080808"/>
                <rect x="1" y="7" width="6" height="4" rx="1" fill="#080808"/>
                <rect x="9" y="7" width="6" height="4" rx="1" fill="#080808"/>
                <rect x="1" y="13" width="14" height="2" rx="1" fill="#080808"/>
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
              DOOH<span style={{ color: "var(--accent)" }}>.</span>
            </span>
          </Link>

          <div className="app-topbar-links">
            <Link href="/screens" className="btn btn-secondary btn-sm">Screens</Link>
            <Link href="/dashboard" className="btn btn-secondary btn-sm">Advertiser</Link>
            <Link href="/bookings" className="btn btn-secondary btn-sm">Bookings</Link>
            <Link href="/owner" className="btn btn-secondary btn-sm">Owner</Link>
            <Link href="/owner/screens" className="btn btn-secondary btn-sm">Owner screens</Link>
            <button onClick={handleSignOut} className="btn btn-secondary btn-sm">Sign out</button>
          </div>
        </div>

        <div className="app-titlebar">
          <div>
            <p className="t-label-accent" style={{ marginBottom: 6 }}>{eyebrow}</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              {title}
            </h1>
            {description && (
              <p style={{ color: "var(--text-secondary)", maxWidth: 620, marginTop: 8 }}>
                {description}
              </p>
            )}
          </div>
          {actions}
        </div>

        {children}
      </div>
    </div>
  )
}
