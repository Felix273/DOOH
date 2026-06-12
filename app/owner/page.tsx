"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types"

export default function OwnerDashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "var(--space-8)" }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-10)" }}>
          <div>
            <p className="t-label-accent" style={{ marginBottom: 6 }}>Media Owner Dashboard</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
          </div>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Sign out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: "var(--space-10)" }}>
          {[
            { label: "Active Screens", value: "0" },
            { label: "Pending Bookings", value: "0" },
            { label: "Revenue MTD", value: "KES 0" },
            { label: "Total Bookings", value: "0" },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="stat-card-label">{stat.label}</p>
              <p className="stat-card-value">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{
          padding: "var(--space-16)", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "var(--radius-lg)",
            background: "var(--accent-dim)", border: "1px solid rgba(200,255,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              No screens listed yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400 }}>
              List your first digital screen and start receiving bookings from advertisers across Kenya.
            </p>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 8 }}>
            List Your First Screen →
          </button>
        </div>
      </div>
    </div>
  )
}
