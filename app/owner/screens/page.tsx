"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AppShell from "@/app/components/AppShell"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, getScreenTypeLabel } from "@/lib/utils"

type OwnerScreen = {
  id: string
  name: string
  screen_type: string
  status: string
  city: string
  area: string | null
  address: string
  price_per_day: number
  is_featured: boolean
  created_at: string
  screen_images?: { url: string; is_primary: boolean }[]
}

function statusClass(status: string) {
  if (status === "active") return "badge badge-live"
  if (status === "pending") return "badge badge-accent"
  return "badge badge-draft"
}

export default function OwnerScreensPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [screens, setScreens] = useState<OwnerScreen[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadScreens() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("screens")
        .select("id, name, screen_type, status, city, area, address, price_per_day, is_featured, created_at, screen_images(url, is_primary)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      setScreens(data ?? [])
      setLoading(false)
    }

    loadScreens()
  }, [router, supabase])

  return (
    <AppShell
      eyebrow="Media Owner"
      title="Your screens"
      description="Manage submitted inventory and track which screens are pending, active, or suspended."
      actions={<Link href="/owner/screens/new" className="btn btn-primary">List new screen</Link>}
    >
      {loading ? (
        <div className="card" style={{ padding: "var(--space-10)", color: "var(--text-muted)" }}>Loading screens...</div>
      ) : screens.length === 0 ? (
        <div className="card" style={{ padding: "var(--space-16)", textAlign: "center" }}>
          <h2 className="t-heading" style={{ marginBottom: 8 }}>No screens listed yet</h2>
          <p className="t-body" style={{ margin: "0 auto 24px", maxWidth: 460 }}>
            Add your first screen and submit it for admin approval.
          </p>
          <Link href="/owner/screens/new" className="btn btn-primary">List your first screen</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {screens.map(screen => {
            const primaryImage = screen.screen_images?.find(image => image.is_primary) ?? screen.screen_images?.[0]

            return (
              <div key={screen.id} className="card" style={{ overflow: "hidden" }}>
                <div
                  className="screen-thumb"
                  style={{
                    border: "none",
                    borderRadius: 0,
                    backgroundImage: primaryImage ? `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.06)), url(${primaryImage.url})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ padding: "var(--space-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                    <div>
                      <h2 className="t-subheading" style={{ color: "var(--text-primary)" }}>{screen.name}</h2>
                      <p className="t-body-sm">{screen.area ? `${screen.area}, ` : ""}{screen.city}</p>
                    </div>
                    <span className={statusClass(screen.status)}>{screen.status}</span>
                  </div>
                  <p className="t-body-sm" style={{ marginBottom: 14 }}>{screen.address}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span className="badge badge-draft">{getScreenTypeLabel(screen.screen_type)}</span>
                    <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(Number(screen.price_per_day))}/day</strong>
                  </div>
                  {screen.status === "active" && (
                    <Link href={`/screens/${screen.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
                      View public listing
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
