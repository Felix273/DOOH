"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
// ─── Ticker ──────────────────────────────────────────────────

const TICKER_ITEMS = [
  "1,284 screens online across Kenya",
  "KSh 3.8M revenue MTD",
  "47 active campaigns",
  "2.4M impressions today",
  "99.2% network uptime",
  "Nairobi · Mombasa · Kisumu · Eldoret",
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Network Showcase ────────────────────────────────────────────────────────

type CampaignStatus = "live" | "draft" | "coming"

function StatusBadge({ status }: { status: CampaignStatus }) {
  const statusMap = {
    live: { label: "Live", className: "badge badge-live" },
    draft: { label: "Draft", className: "badge badge-draft" },
    coming: { label: "Soon", className: "badge badge-draft" },
  }

  const { label, className } = statusMap[status]

  return <span className={className}>{label}</span>
}

const SHOWCASE_SCREENS = [
  {
    id: 1,
    name: "CBD Moi Ave",
    location: "Nairobi CBD",
    type: "Billboard",
    status: "live" as CampaignStatus,
    img: "https://images.unsplash.com/photo-1509391111902-de5b6f692025?w=800&q=80",
  },
  {
    id: 2,
    name: "Westlands Roundabout",
    location: "Westlands",
    type: "Digital Billboard",
    status: "live" as CampaignStatus,
    img: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=800&q=80",
  },
  {
    id: 3,
    name: "Junction Mall Entrance",
    location: "Ngong Road",
    type: "Mall Screen",
    status: "live" as CampaignStatus,
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
  {
    id: 4,
    name: "Uhuru Hwy Overpass",
    location: "Industrial Area",
    type: "Billboard",
    status: "live" as CampaignStatus,
    img: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=800&q=80",
  },
  {
    id: 5,
    name: "Gikomba Market Gate",
    location: "Eastlands",
    type: "Transit",
    status: "live" as CampaignStatus,
    img: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&q=80",
  },
  {
    id: 6,
    name: "Karen Hub Billboard",
    location: "Karen",
    type: "Billboard",
    status: "draft" as CampaignStatus,
    img: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
  },
]

function NetworkShowcase() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p className="t-label" style={{ marginBottom: 6 }}>Live Network</p>
          <h2 className="t-heading">Screen Showcase</h2>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }}>
          View all screens →
        </button>
      </div>

      {/* Photo grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}>
        {SHOWCASE_SCREENS.map((screen) => (
          <div
            key={screen.id}
            className="screen-thumb"
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid var(--border-subtle)",
              aspectRatio: "16/9",
            }}
          >
            {/* Photo */}
            <Image
              src={screen.img}
              alt={`${screen.name} DOOH screen`}
              fill
              sizes="(max-width: 1280px) 33vw, 400px"
              style={{ objectFit: "cover" }}
            />

            {/* Cinematic dark overlay — stronger at bottom for text legibility */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0) 100%)",
            }} />

            {/* Live glow border when active */}
            {screen.status === "live" && (
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "var(--radius-lg)",
                boxShadow: "inset 0 0 0 1px rgba(0,230,118,0.35)",
                pointerEvents: "none",
              }} />
            )}

            {/* Bottom info */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 14px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                  marginBottom: 2,
                }}>
                  {screen.name}
                </p>
                <p style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.04em",
                }}>
                  {screen.location} · {screen.type}
                </p>
              </div>
              <StatusBadge status={screen.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ─── Nav ─────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <nav className="nav" style={{ borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent" }}>
      <div className="nav-inner">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="9" y="1" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="1" y="7" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="9" y="7" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="1" y="13" width="14" height="2" rx="1" fill="#080808"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>
            DOOH<span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 2, margin: "0 auto" }}>
          {["Product", "Network", "Pricing", "Case Studies", "About"].map(link => (
            <a key={link} href="#" style={{
              padding: "6px 14px",
              fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
              color: "var(--text-secondary)",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >{link}</a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm">Log in</button>
          <button className="btn btn-primary btn-sm">Get Started →</button>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────

function Hero() {
  const [time, setTime] = useState<Date | null>(null)
  useEffect(() => {
    setTime(new Date())
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "120px var(--space-8) 80px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Live badge */}
      <div style={{ marginBottom: 32 }}>
        <span className="badge badge-live">
          Live Network — {time ? time.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) : "—"} EAT
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(48px, 8vw, 96px)",
        fontWeight: 700,
        lineHeight: 1.0,
        letterSpacing: "-0.04em",
        color: "var(--text-primary)",
        maxWidth: 900,
        marginBottom: 28,
      }}>
        Kenya&apos;s Most Powerful<br />
        <span style={{ color: "var(--accent)" }}>Digital OOH</span> Platform
      </h1>

      {/* Sub */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "clamp(16px, 2vw, 20px)",
        color: "var(--text-secondary)",
        maxWidth: 560,
        lineHeight: 1.65,
        marginBottom: 48,
      }}>
        Launch, manage, and measure billboard campaigns across 1,284 premium digital screens — from Nairobi CBD to the Coast.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}>
        <button className="btn btn-primary btn-lg">Start a Campaign →</button>
        <button className="btn btn-secondary btn-lg">View Our Network</button>
      </div>

      {/* Hero stats strip */}
      <div style={{
        display: "flex",
        gap: 0,
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        background: "var(--bg-surface)",
      }}>
        {[
          { value: "1,284", label: "Digital Screens" },
          { value: "47+", label: "Cities & Towns" },
          { value: "2.4M", label: "Daily Impressions" },
          { value: "99.2%", label: "Network Uptime" },
        ].map((s, i, arr) => (
          <div key={i} style={{
            padding: "24px 40px",
            borderRight: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
              letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 4,
            }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
      title: "Pan-Kenya Network",
      desc: "Access premium inventory across Nairobi, Mombasa, Kisumu, Nakuru, and Eldoret. Urban highways, malls, stadiums, and transit hubs.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      title: "Real-Time Campaign Control",
      desc: "Go live in minutes. Update creatives, adjust scheduling, and pause campaigns instantly — all from one dashboard.",
    },
    {
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Impression Analytics",
      desc: "Track reach, frequency, and engagement with verified impression data. Generate client-ready reports in one click.",
    },
    {
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Programmatic Scheduling",
      desc: "Set dayparting rules, audience triggers, and automated rotations. Your campaign works while you sleep.",
    },
    {
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      title: "Multi-Client Management",
      desc: "Built for agencies. Manage dozens of client accounts, brands, and budgets under one login with role-based access.",
    },
    {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "99.2% Uptime SLA",
      desc: "Enterprise-grade infrastructure with remote monitoring, automatic failover, and 24/7 NOC support across all screens.",
    },
  ]

  return (
    <section style={{ padding: "100px var(--space-8)", maxWidth: "var(--max-width)", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <p className="t-label-accent" style={{ marginBottom: 12 }}>Platform Features</p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)",
          fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 16,
        }}>Everything you need to dominate OOH</h2>
        <p className="t-body" style={{ maxWidth: 480, margin: "0 auto" }}>
          One platform to plan, launch, and measure every billboard campaign across Kenya.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        {features.map((f, i) => (
          <div key={i} className="card" style={{
            padding: 32, borderRadius: 0, border: "none",
            transition: "background var(--transition-base)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-surface)")}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: "var(--accent-dim)", border: "1px solid rgba(200,255,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={f.icon}/>
              </svg>
            </div>
            <h3 style={{
              fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600,
              letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 10,
            }}>{f.title}</h3>
            <p className="t-body-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Network Map ──────────────────────────────────────────────

function Network() {
  const cities = [
    { name: "Nairobi",  screens: 724, status: "live" },
    { name: "Mombasa",  screens: 198, status: "live" },
    { name: "Kisumu",   screens: 112, status: "live" },
    { name: "Nakuru",   screens: 89,  status: "live" },
    { name: "Eldoret",  screens: 76,  status: "live" },
    { name: "Thika",    screens: 45,  status: "live" },
    { name: "Nyeri",    screens: 24,  status: "live" },
    { name: "Malindi",  screens: 16,  status: "coming" },
  ]

  return (
    <section style={{ padding: "100px var(--space-8)", background: "var(--bg-surface)" }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left */}
          <div>
            <p className="t-label-accent" style={{ marginBottom: 12 }}>Our Network</p>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 20,
            }}>Screens everywhere<br />your audience is</h2>
            <p className="t-body" style={{ marginBottom: 40 }}>
              From Nairobi&apos;s busiest intersections to coastal tourism hubs — our network reaches Kenyans where they live, work, and commute.
            </p>
            <div style={{ display: "flex", gap: 40, marginBottom: 40 }}>
              {[{ v: "1,284", l: "Total Screens" }, { v: "8", l: "Major Cities" }, { v: "47+", l: "Locations" }].map((s, i) => (
                <div key={i}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>{s.v}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{s.l}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-primary">Explore Full Network →</button>
          </div>

          {/* Right — city list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {cities.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px", background: "var(--bg-surface)",
                transition: "background var(--transition-fast)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-surface)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: c.status === "live" ? "var(--status-live)" : "var(--text-muted)",
                    boxShadow: c.status === "live" ? "0 0 6px var(--status-live)" : "none",
                  }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
                    {c.status === "live" ? `${c.screens} screens` : "Coming soon"}
                  </span>
                  {c.status === "live"
                    ? <span className="badge badge-live">Live</span>
                    : <span className="badge badge-draft">Soon</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { num: "01", title: "Choose Your Screens", desc: "Browse our interactive map. Filter by city, location type, footfall, and demographics to find the perfect inventory." },
    { num: "02", title: "Upload Your Creative", desc: "Upload your artwork or use our built-in editor. We support all standard digital billboard formats and aspect ratios." },
    { num: "03", title: "Set Schedule & Budget", desc: "Define your dayparting, campaign duration, and total spend. Our system calculates estimated impressions in real time." },
    { num: "04", title: "Go Live & Measure", desc: "Launch with one click. Track impressions, reach, and engagement live — then download a full report for your client." },
  ]

  return (
    <section style={{ padding: "100px var(--space-8)", maxWidth: "var(--max-width)", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <p className="t-label-accent" style={{ marginBottom: 12 }}>How It Works</p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)",
          fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)",
        }}>From brief to billboard<br />in under 10 minutes</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ position: "relative" }}>
            {i < steps.length - 1 && (
              <div style={{
                position: "absolute", top: 20, left: "calc(100% - 12px)",
                width: "calc(100% - 24px)", height: 1,
                background: "linear-gradient(to right, var(--border-default), transparent)",
                zIndex: 0,
              }} />
            )}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)",
              }}>{s.num}</div>
              <h3 style={{
                fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600,
                letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 10,
              }}>{s.title}</h3>
              <p className="t-body-sm">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Social Proof ─────────────────────────────────────────────

function SocialProof() {
  const clients = ["Safaricom", "KCB Group", "Equity Bank", "Airtel Kenya", "EABL", "Nation Media", "Bamburi", "Co-op Bank"]

  return (
    <section style={{ padding: "80px var(--space-8)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", textAlign: "center" }}>
        <p className="t-label" style={{ marginBottom: 40 }}>Trusted by Kenya&apos;s leading brands</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {clients.map((c, i) => (
            <div key={i} style={{
              padding: "10px 24px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
              color: "var(--text-muted)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-default)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border-subtle)" }}
            >{c}</div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────

function CTA() {
  return (
    <section style={{ padding: "120px var(--space-8)" }}>
      <div style={{
        maxWidth: 800, margin: "0 auto", textAlign: "center",
        padding: "80px 60px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,255,0,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <p className="t-label-accent" style={{ marginBottom: 16 }}>Ready to go live?</p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 20,
        }}>Put your brand on<br />every screen in Kenya</h2>
        <p className="t-body" style={{ maxWidth: 420, margin: "0 auto 40px" }}>
          Join 200+ brands already running campaigns on Kenya&apos;s most connected digital OOH network.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg">Start Your Campaign →</button>
          <button className="btn btn-secondary btn-lg">Talk to Sales</button>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "48px var(--space-8)" }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="9" y="1" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="1" y="7" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="9" y="7" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="1" y="13" width="14" height="2" rx="1" fill="#080808"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em" }}>
            DOOH<span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>© 2025 DOOH Platform. Nairobi, Kenya.</p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none",
              transition: "color var(--transition-fast)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── Root Page ────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: "var(--nav-height)" }}>
        <Ticker />
      </div>
      <Hero />
      <SocialProof />
      <Features />
      <NetworkShowcase />
      <Network />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  )
}
