"use client"
export const dynamic = 'force-dynamic'
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import type { Profile } from "@/types"

type OwnerStats = {
  activeScreens: number
  pendingBookings: number
  revenueMtd: number
  totalBookings: number
}

type OwnerScreenSummary = {
  id: string
  name: string
  status: string
  city: string
  area: string | null
  created_at: string
}

export default function OwnerDashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [screens, setScreens] = useState<OwnerScreenSummary[]>([])
  const [stats, setStats] = useState<OwnerStats>({
    activeScreens: 0,
    pendingBookings: 0,
    revenueMtd: 0,
    totalBookings: 0,
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

      const { data: screens } = await supabase
        .from("screens")
        .select("id, name, status, city, area, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      const screenIds = screens?.map(screen => screen.id) ?? []
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { data: bookings } = screenIds.length > 0
        ? await supabase
            .from("bookings")
            .select("id, status, amount_total, payment_status, created_at")
            .in("screen_id", screenIds)
        : { data: [] }

      setProfile(data)
      setScreens(screens ?? [])
      setStats({
        activeScreens: screens?.filter(screen => screen.status === "active").length ?? 0,
        pendingBookings: bookings?.filter(booking => booking.status === "pending").length ?? 0,
        revenueMtd: bookings
          ?.filter(booking =>
            booking.payment_status === "paid"
            && new Date(booking.created_at) >= monthStart
          )
          .reduce((sum, booking) => sum + Number(booking.amount_total), 0) ?? 0,
        totalBookings: bookings?.length ?? 0,
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

        <div className="app-titlebar">
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

        <div className="responsive-grid responsive-grid-4" style={{ marginBottom: "var(--space-10)" }}>
          {[
            { label: "Active Screens", value: String(stats.activeScreens) },
            { label: "Pending Bookings", value: String(stats.pendingBookings) },
            { label: "Revenue MTD", value: formatCurrency(stats.revenueMtd) },
            { label: "Total Bookings", value: String(stats.totalBookings) },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="stat-card-label">{stat.label}</p>
              <p className="stat-card-value">{stat.value}</p>
            </div>
          ))}
        </div>

        {screens.length === 0 ? (
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
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              <Link href="/owner/screens/new" className="btn btn-primary">List Your First Screen →</Link>
              <Link href="/owner/screens" className="btn btn-secondary">Manage Screens</Link>
              <Link href="/owner/bookings" className="btn btn-secondary">Review Bookings</Link>
            </div>
          </div>
        ) : (
          <div className="responsive-grid responsive-grid-2">
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div className="card-row">
                <div>
                  <h2 className="t-heading" style={{ marginBottom: 6 }}>Recent screens</h2>
                  <p className="t-body-sm">Submitted inventory appears here immediately, then moves public after admin approval.</p>
                </div>
                <Link href="/owner/screens/new" className="btn btn-primary btn-sm">List screen</Link>
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                {screens.slice(0, 4).map(screen => (
                  <div key={screen.id} className="card" style={{ padding: "var(--space-4)" }}>
                    <div className="card-row" style={{ marginBottom: 0 }}>
                      <div>
                        <h3 className="t-subheading" style={{ color: "var(--text-primary)" }}>{screen.name}</h3>
                        <p className="t-body-sm">{screen.area ? `${screen.area}, ` : ""}{screen.city}</p>
                      </div>
                      <span className={screen.status === "active" ? "badge badge-live" : screen.status === "pending" ? "badge badge-accent" : "badge badge-draft"}>
                        {screen.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
              <div>
                <h2 className="t-heading" style={{ marginBottom: 8 }}>Next actions</h2>
                <p className="t-body-sm">
                  Keep inventory fresh, review booking requests, and watch pending screens move into the public marketplace.
                </p>
              </div>
              <div className="button-row" style={{ justifyContent: "flex-start" }}>
                <Link href="/owner/screens" className="btn btn-primary">Manage Screens</Link>
                <Link href="/owner/bookings" className="btn btn-secondary">Review Bookings</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
