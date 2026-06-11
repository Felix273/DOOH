"use client"
import { useState, useEffect } from "react"

// ─── Mock Data ───────────────────────────────────────────────

const STATS = [
  { label: "Active Screens",    value: "1,284",  delta: "+12 this week",  accent: false },
  { label: "Live Campaigns",    value: "47",     delta: "+3 today",       accent: true  },
  { label: "Impressions Today", value: "2.4M",   delta: "↑ 18% vs. avg", accent: false },
  { label: "Revenue (MTD)",     value: "KSh 3.8M", delta: "On track",    accent: false },
]

const CAMPAIGNS = [
  { id: "C-001", name: "Safaricom 5G Launch",     client: "Safaricom PLC",   screens: 84, status: "live",      impressions: "428K",  budget: "KSh 480K"  },
  { id: "C-002", name: "KCB Bank — Q3 Promo",    client: "KCB Group",       screens: 36, status: "live",      impressions: "201K",  budget: "KSh 220K"  },
  { id: "C-003", name: "Tusker Oktoberfest",      client: "EABL",            screens: 52, status: "live",      impressions: "315K",  budget: "KSh 380K"  },
  { id: "C-004", name: "Equity Bank SME Drive",   client: "Equity Group",    screens: 28, status: "paused",    impressions: "88K",   budget: "KSh 150K"  },
  { id: "C-005", name: "Nation Media OOH",        client: "Nation Media Grp",screens: 19, status: "scheduled", impressions: "—",     budget: "KSh 95K"   },
  { id: "C-006", name: "Airtel Unlimited Data",   client: "Airtel Kenya",    screens: 62, status: "live",      impressions: "371K",  budget: "KSh 340K"  },
  { id: "C-007", name: "Bamburi Cement Relaunch", client: "Bamburi Cement",  screens: 14, status: "draft",     impressions: "—",     budget: "KSh 75K"   },
]

const SCREENS = [
  { id: "SCR-001", name: "CBD Moi Ave",       location: "Nairobi CBD",        status: "online",  fill: 92 },
  { id: "SCR-002", name: "Westlands Roundabout", location: "Westlands",      status: "online",  fill: 78 },
  { id: "SCR-003", name: "Junction Mall Entrance", location: "Ngong Road",   status: "online",  fill: 85 },
  { id: "SCR-004", name: "Karen Hub Billboard",  location: "Karen",           status: "offline", fill: 0  },
  { id: "SCR-005", name: "Uhuru Hwy Overpass",   location: "Industrial Area", status: "online",  fill: 100},
  { id: "SCR-006", name: "Gikomba Market Gate",  location: "Eastlands",       status: "online",  fill: 55 },
]

const TICKER_ITEMS = [
  "1,284 screens online",
  "KSh 3.8M revenue MTD",
  "47 active campaigns",
  "2.4M impressions today",
  "99.2% network uptime",
  "12 new screens added",
  "Nairobi · Mombasa · Kisumu · Eldoret",
]

type CampaignStatus = "live" | "paused" | "draft" | "scheduled" | "ended"
type ScreenStatus   = "online" | "offline" | "maintenance"

// ─── Status Helpers ──────────────────────────────────────────

function StatusBadge({ status }: { status: CampaignStatus }) {
  const map = {
    live:      { label: "Live",      cls: "badge-live"    },
    paused:    { label: "Paused",    cls: "badge-paused"  },
    draft:     { label: "Draft",     cls: "badge-draft"   },
    scheduled: { label: "Scheduled", cls: "badge-accent"  },
    ended:     { label: "Ended",     cls: "badge-draft"   },
  }
  const { label, cls } = map[status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function ScreenDot({ status }: { status: ScreenStatus }) {
  const color = status === "online" ? "#00e676" : status === "offline" ? "#ff4444" : "#ffc107"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(240,240,240,0.55)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block",
        boxShadow: status === "online" ? `0 0 6px ${color}` : "none" }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ─── Ticker ──────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // doubled for seamless loop
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

// ─── Nav ─────────────────────────────────────────────────────

function Nav({ activeSection, setActiveSection }: {
  activeSection: string
  setActiveSection: (s: string) => void
}) {
  const links = ["Dashboard", "Campaigns", "Screens", "Analytics", "Creatives"]
  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
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
          <span className="badge badge-live" style={{ marginLeft: 4 }}>Live</span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 2 }}>
          {links.map(link => (
            <button key={link}
              onClick={() => setActiveSection(link)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "6px 14px",
                fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                color: activeSection === link ? "var(--text-primary)" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                background: activeSection === link ? "var(--bg-elevated)" : "transparent",
                transition: "all var(--transition-fast)",
              }}>
              {link}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button className="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
          <button className="btn btn-primary btn-sm">+ New Campaign</button>
        </div>
      </div>
    </nav>
  )
}

// ─── Dashboard View ──────────────────────────────────────────

function Dashboard() {
  const [time, setTime] = useState<Date | null>(null)
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p className="t-label" style={{ marginBottom: 8 }}>Overview</p>
          <h1 className="t-heading-lg">Dashboard</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700,
            letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            {time ? time.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
          </p>
          <p className="t-body-sm">Nairobi, Kenya · EAT (UTC+3)</p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card" style={s.accent ? { borderColor: "rgba(200,255,0,0.2)", background: "var(--accent-glow)" } : {}}>
            <p className="stat-card-label">{s.label}</p>
            <p className="stat-card-value" style={s.accent ? { color: "var(--accent)" } : {}}>{s.value}</p>
            <p className="stat-card-delta">{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Two-column: campaigns + screens */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* Campaigns table */}
        <div className="card">
          <div className="card-body" style={{ paddingBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p className="t-label" style={{ marginBottom: 4 }}>Active Campaigns</p>
                <p className="t-subheading">47 running across network</p>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }}>View all →</button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Screens</th>
                <th>Impressions</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13, color: "var(--text-primary)", marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{c.client}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{c.screens}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{c.impressions}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{c.budget}</td>
                  <td><StatusBadge status={c.status as CampaignStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Screen status panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Network health */}
          <div className="card-elevated" style={{ padding: 20 }}>
            <p className="t-label" style={{ marginBottom: 12 }}>Network Health</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--status-live)", letterSpacing: "-0.03em" }}>99.2%</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>UPTIME</p>
              </div>
              <div style={{ width: 1, background: "var(--border-subtle)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>1,271</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>ONLINE</p>
              </div>
              <div style={{ width: 1, background: "var(--border-subtle)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--status-error)", letterSpacing: "-0.03em" }}>13</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>OFFLINE</p>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "99.2%" }} />
            </div>
          </div>

          {/* Screen list */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ padding: "16px 20px 0" }}>
              <p className="t-label" style={{ marginBottom: 12 }}>Screen Status</p>
            </div>
            <div>
              {SCREENS.map((s, i) => (
                <div key={s.id} style={{
                  padding: "12px 20px",
                  borderBottom: i < SCREENS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", transition: "background var(--transition-fast)",
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em" }}>{s.location}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <ScreenDot status={s.status as ScreenStatus} />
                    {s.status === "online" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 48, height: 2, background: "var(--border-subtle)", borderRadius: 99 }}>
                          <div style={{ height: "100%", width: `${s.fill}%`,
                            background: s.fill === 100 ? "var(--accent)" : "var(--status-live)",
                            borderRadius: 99, transition: "width 0.6s ease" }} />
                        </div>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.fill}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip — activity log */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p className="t-label">Recent Activity</p>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }}>View log →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border-subtle)" }}>
          {[
            { time: "14:32", msg: "Safaricom 5G — creative updated", type: "info" },
            { time: "13:58", msg: "SCR-004 Karen Hub went offline", type: "error" },
            { time: "13:41", msg: "KCB Q3 Promo impressions hit 200K", type: "success" },
            { time: "12:20", msg: "Airtel Unlimited — 3 new screens added", type: "info" },
            { time: "11:55", msg: "Nation Media OOH scheduled for Mon", type: "info" },
            { time: "10:30", msg: "Equity Bank campaign paused by client", type: "warn" },
          ].map((a, i) => (
            <div key={i} style={{ background: "var(--bg-surface)", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                  background: a.type === "error" ? "var(--status-error)" : a.type === "success" ? "var(--status-live)" : a.type === "warn" ? "var(--status-paused)" : "var(--text-muted)" }} />
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-primary)", marginBottom: 2 }}>{a.msg}</p>
                  <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>Today · {a.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ─── Placeholder Views ────────────────────────────────────────

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: 400, gap: 16, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)",
        background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,240,0.28)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      </div>
      <div>
        <p className="t-subheading" style={{ marginBottom: 6 }}>{title}</p>
        <p className="t-body-sm">This section is under construction.</p>
      </div>
      <button className="btn btn-primary btn-sm">Coming soon</button>
    </div>
  )
}

// ─── Root Page ────────────────────────────────────────────────

export default function Home() {
  const [activeSection, setActiveSection] = useState("Dashboard")

  const views: Record<string, JSX.Element> = {
    Dashboard: <Dashboard />,
    Campaigns: <Placeholder title="Campaigns" />,
    Screens:   <Placeholder title="Screens" />,
    Analytics: <Placeholder title="Analytics" />,
    Creatives: <Placeholder title="Creatives" />,
  }

  return (
    <>
      <Nav activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Ticker below nav */}
      <div style={{ paddingTop: "var(--nav-height)" }}>
        <Ticker />
      </div>

      {/* Main layout */}
      <div style={{ display: "flex" }}>

        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ padding: "0 0 16px", borderBottom: "1px solid var(--border-subtle)", marginBottom: 8 }}>
            <div style={{ padding: "0 24px" }}>
              <p className="t-label" style={{ marginBottom: 8 }}>Platform</p>
            </div>
          </div>
          {[
            { label: "Dashboard",  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { label: "Campaigns",  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { label: "Screens",    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { label: "Analytics",  icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { label: "Creatives",  icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
          ].map(item => (
            <button key={item.label}
              onClick={() => setActiveSection(item.label)}
              className={`sidebar-item ${activeSection === item.label ? "active" : ""}`}
              style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </button>
          ))}

          <div style={{ padding: "16px 0", borderTop: "1px solid var(--border-subtle)", marginTop: 16 }}>
            <div style={{ padding: "0 24px", marginBottom: 8 }}>
              <p className="t-label">Management</p>
            </div>
            {[
              { label: "Clients",   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Settings",  icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
            ].map(item => (
              <button key={item.label}
                onClick={() => setActiveSection(item.label)}
                className="sidebar-item"
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {item.label}
              </button>
            ))}
          </div>

          {/* Network status widget */}
          <div style={{ margin: "12px 16px", padding: 14, borderRadius: "var(--radius-md)",
            background: "var(--accent-glow)", border: "1px solid rgba(200,255,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent)", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "var(--accent)" }}>Network Live</span>
            </div>
            <p style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700,
              letterSpacing: "-0.03em", color: "var(--text-primary)" }}>1,271</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>screens broadcasting</p>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content" style={{ marginLeft: "var(--sidebar-width)" }}>
          {views[activeSection] ?? <Placeholder title={activeSection} />}
        </main>
      </div>
    </>
  )
}
