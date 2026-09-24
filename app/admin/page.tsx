"use client"
export const dynamic = 'force-dynamic'
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Screen, Profile } from "@/types"

type ScreenWithOwner = Screen & { profiles: Profile | null }
type Tab = "pending" | "active" | "suspended"

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [screens, setScreens] = useState<ScreenWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchScreens = useCallback(async () => {
    const { data } = await supabase
      .from("screens")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
    setScreens((data ?? []) as ScreenWithOwner[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      await fetchScreens()
    }
    void load()
  }, [fetchScreens, router, supabase])

  async function updateScreenStatus(screenId: string, status: "active" | "suspended" | "pending") {
    setActionLoading(screenId)
    try {
      const { error } = await supabase.from("screens").update({ status }).eq("id", screenId)
      if (error) throw error
      await fetchScreens()
    } finally {
      setActionLoading(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const filtered = screens.filter(s => s.status === tab)
  const counts = {
    pending:   screens.filter(s => s.status === "pending").length,
    active:    screens.filter(s => s.status === "active").length,
    suspended: screens.filter(s => s.status === "suspended").length,
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "var(--space-8)" }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-10)" }}>
          <div>
            <p className="t-label-accent" style={{ marginBottom: 6 }}>Admin Panel</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Platform Overview
            </h1>
          </div>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">Sign out</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: "var(--space-10)" }}>
          {[
            { label: "Total Screens",  value: String(screens.length) },
            { label: "Pending Review", value: String(counts.pending), accent: counts.pending > 0 },
            { label: "Active Screens", value: String(counts.active) },
            { label: "Suspended",      value: String(counts.suspended) },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="stat-card-label">{stat.label}</p>
              <p className="stat-card-value" style={stat.accent ? { color: "var(--accent)" } : {}}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", padding: 4, width: "fit-content" }}>
          {(["pending", "active", "suspended"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500,
              cursor: "pointer", border: "none", textTransform: "capitalize", transition: "all 0.15s",
              background: tab === t ? "var(--bg-surface)" : "transparent",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
            }}>
              {t} ({counts[t]})
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: "var(--space-16)", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No {tab} screens.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(screen => (
              <div key={screen.id} className="card" style={{ padding: "var(--space-6)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{screen.name}</p>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "999px", background: "var(--bg-overlay)", color: "var(--text-muted)" }}>{screen.screen_type}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{screen.address}, {screen.city}{screen.area ? ` · ${screen.area}` : ""}</p>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                      <span>KES {screen.price_per_day.toLocaleString()}/day</span>
                      {screen.profiles?.full_name && <span>Owner: <strong style={{ color: "var(--text-secondary)" }}>{screen.profiles.full_name}</strong></span>}
                      <span>{new Date(screen.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {screen.status === "pending" && (<>
                      <button className="btn btn-primary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "active")}>{actionLoading === screen.id ? "..." : "✓ Approve"}</button>
                      <button className="btn btn-secondary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "suspended")} style={{ color: "#ff4444", borderColor: "rgba(255,68,68,0.3)" }}>Reject</button>
                    </>)}
                    {screen.status === "active" && <button className="btn btn-secondary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "suspended")} style={{ color: "#ffc107", borderColor: "rgba(255,193,7,0.3)" }}>{actionLoading === screen.id ? "..." : "Suspend"}</button>}
                    {screen.status === "suspended" && <button className="btn btn-secondary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "active")} style={{ color: "#00e676", borderColor: "rgba(0,230,118,0.3)" }}>{actionLoading === screen.id ? "..." : "Re-activate"}</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
