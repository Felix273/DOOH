"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("all")
  const [type, setType] = useState("all")

  const loadScreens = useCallback(async () => {
    setLoading(true)
    setError("")

    const { data, error: queryError } = await supabase
      .from("screens")
      .select("id, name, screen_type, city, area, address, price_per_day, is_featured, screen_images(url, is_primary)")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })

    if (queryError) {
      setScreens([])
      setError("We couldn't load the live inventory right now. Please retry or contact support if the problem continues.")
    } else {
      setScreens(data ?? [])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadScreens()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadScreens])

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
      description="Find active digital screens by city, format, location, and daily price. Select a screen to see specs, availability, and booking totals."
    >
      <div className="screen-filters" role="search" aria-label="Filter screen inventory">
        <input
          className="input"
          aria-label="Search screens"
          placeholder="Search by location, screen, or address"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <select className="input" aria-label="Filter by city" value={city} onChange={event => setCity(event.target.value)}>
          <option value="all">All cities</option>
          {cities.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="input" aria-label="Filter by format" value={type} onChange={event => setType(event.target.value)}>
          <option value="all">All formats</option>
          {types.map(item => <option key={item} value={item}>{getScreenTypeLabel(item)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="card" role="status" aria-live="polite" style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-secondary)" }}>
          <p className="t-heading" style={{ marginBottom: 8 }}>Loading live inventory</p>
          <p>Fetching active screens and current daily rates.</p>
        </div>
      ) : error ? (
        <div className="card" role="alert" style={{ padding: "var(--space-10)", textAlign: "center" }}>
          <p className="t-heading" style={{ marginBottom: 8 }}>Inventory unavailable</p>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => void loadScreens()}>Retry loading screens</button>
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="card" style={{ padding: "var(--space-10)", textAlign: "center" }}>
          <p className="t-heading" style={{ marginBottom: 8 }}>{screens.length === 0 ? "No active screens yet" : "No screens match these filters"}</p>
          <p style={{ color: "var(--text-secondary)", marginBottom: screens.length === 0 ? 0 : 20 }}>
            {screens.length === 0 ? "Approved inventory will appear here as media owners publish their screens." : "Try a different city, format, or search term."}
          </p>
          {screens.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => { setQuery(""); setCity("all"); setType("all") }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {filteredScreens.map(screen => {
            const primaryImage = screen.screen_images?.find(image => image.is_primary) ?? screen.screen_images?.[0]

            return (
              <Link key={screen.id} href={`/screens/${screen.id}`} className="card" style={{ textDecoration: "none", color: "inherit", overflow: "hidden" }}>
                <div
                  className="screen-thumb"
                  role="img"
                  aria-label={`${screen.name} screen preview`}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span className="badge badge-info">{getScreenTypeLabel(screen.screen_type)}</span>
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
