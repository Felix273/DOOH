"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import AppShell from "@/app/components/AppShell"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, getScreenTypeLabel } from "@/lib/utils"

type ScreenListItem = {
  id: string
  name: string
  screen_type: string
  city: string
  area: string | null
  address: string
  price_per_day: number
  is_featured: boolean
  screen_images?: { url: string; is_primary: boolean }[]
}

export default function ScreensPage() {
  const supabase = useMemo(() => createClient(), [])
  const [screens, setScreens] = useState<ScreenListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("all")
  const [type, setType] = useState("all")

  useEffect(() => {
    async function loadScreens() {
      const { data } = await supabase
        .from("screens")
        .select("id, name, screen_type, city, area, address, price_per_day, is_featured, screen_images(url, is_primary)")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })

      setScreens(data ?? [])
      setLoading(false)
    }

    loadScreens()
  }, [supabase])

  const cities = Array.from(new Set(screens.map(screen => screen.city))).sort()
  const types = Array.from(new Set(screens.map(screen => screen.screen_type))).sort()

  const filteredScreens = screens.filter(screen => {
    const text = `${screen.name} ${screen.city} ${screen.area ?? ""} ${screen.address}`.toLowerCase()
    return (
      text.includes(query.toLowerCase())
      && (city === "all" || screen.city === city)
      && (type === "all" || screen.screen_type === type)
    )
  })

  return (
    <AppShell
      eyebrow="Screen Marketplace"
      title="Browse available DOOH inventory"
      description="Find active digital screens by city, format, location, and daily price."
    >
      <div className="screen-filters">
        <input
          className="input"
          placeholder="Search by location, screen, or address"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <select className="input" value={city} onChange={event => setCity(event.target.value)}>
          <option value="all">All cities</option>
          {cities.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="input" value={type} onChange={event => setType(event.target.value)}>
          <option value="all">All formats</option>
          {types.map(item => <option key={item} value={item}>{getScreenTypeLabel(item)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-muted)" }}>
          Loading screens...
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="card" style={{ padding: "var(--space-10)", textAlign: "center" }}>
          <h2 className="t-heading" style={{ marginBottom: 8 }}>No active screens found</h2>
          <p style={{ color: "var(--text-secondary)" }}>Try a different filter or check back after inventory is approved.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {filteredScreens.map(screen => {
            const primaryImage = screen.screen_images?.find(image => image.is_primary) ?? screen.screen_images?.[0]

            return (
              <Link key={screen.id} href={`/screens/${screen.id}`} className="card" style={{ textDecoration: "none", color: "inherit", overflow: "hidden" }}>
                <div
                  className="screen-thumb"
                  style={{
                    border: "none",
                    borderRadius: 0,
                    backgroundImage: primaryImage ? `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.05)), url(${primaryImage.url})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ padding: "var(--space-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                    <div>
                      <h2 className="t-subheading" style={{ color: "var(--text-primary)" }}>{screen.name}</h2>
                      <p className="t-body-sm">{screen.area ? `${screen.area}, ` : ""}{screen.city}</p>
                    </div>
                    {screen.is_featured && <span className="badge badge-accent">Featured</span>}
                  </div>
                  <p className="t-body-sm" style={{ marginBottom: 16 }}>{screen.address}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="badge badge-draft">{getScreenTypeLabel(screen.screen_type)}</span>
                    <strong style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                      {formatCurrency(Number(screen.price_per_day))}/day
                    </strong>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
