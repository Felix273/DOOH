"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import type { Profile } from "@/types"

type DashboardStats = {
  activeCampaigns: number
  screensBooked: number
  totalSpend: number
  impressions: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 0,
    screensBooked: 0,
    totalSpend: 0,
    impressions: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data?.role === "admin") {
        router.push("/admin")
        return
      }

      if (data?.role === "media_owner") {
        router.push("/owner")
        return
      }

      const { data: bookings } = await supabase
        .from("bookings")
        .select("screen_id, status, amount_total, payment_status")
        .eq("advertiser_id", user.id)

      setProfile(data)
      setStats({
        activeCampaigns: bookings?.filter(booking => booking.status === "approved").length ?? 0,
        screensBooked: new Set(bookings?.map(booking => booking.screen_id) ?? []).size,
        totalSpend: bookings
          ?.filter(booking => booking.payment_status === "paid")
          .reduce((sum, booking) => sum + Number(booking.amount_total), 0) ?? 0,
        impressions: 0,
      })
      setLoading(false)
    }
    load()
  }, [router, supabase])

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
    <div className="app-page">
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>

        {/* Header */}
        <div className="app-titlebar">
          <div>
            <p className="t-label-accent" style={{ marginBottom: 6 }}>Advertiser Dashboard</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
          </div>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Sign out
          </button>
        </div>

        {/* Placeholder stats */}
        <div className="responsive-grid responsive-grid-4" style={{ marginBottom: "var(--space-10)" }}>
          {[
            { label: "Active Campaigns", value: String(stats.activeCampaigns) },
            { label: "Screens Booked", value: String(stats.screensBooked) },
            { label: "Total Spend", value: formatCurrency(stats.totalSpend) },
            { label: "Impressions", value: String(stats.impressions) },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="stat-card-label">{stat.label}</p>
              <p className="stat-card-value">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
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
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              No campaigns yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400 }}>
              Browse available screens across Kenya and launch your first digital billboard campaign.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <Link href="/screens" className="btn btn-primary">Browse Screens →</Link>
            <Link href="/bookings" className="btn btn-secondary">View Bookings</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
