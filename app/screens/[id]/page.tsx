"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import AppShell from "@/app/components/AppShell"
import { createClient } from "@/lib/supabase/client"
import { calculateBookingAmount, formatCurrency, generateBookingReference, getScreenTypeLabel } from "@/lib/utils"

type ScreenDetail = {
  id: string
  name: string
  description: string | null
  screen_type: string
  city: string
  area: string | null
  address: string
  width_meters: number | null
  height_meters: number | null
  resolution_width: number | null
  resolution_height: number | null
  operating_hours_start: string
  operating_hours_end: string
  price_per_day: number
  screen_images?: { url: string; is_primary: boolean }[]
  profiles?: { company_name: string | null; full_name: string | null } | { company_name: string | null; full_name: string | null }[] | null
}

function firstProfile(profile: ScreenDetail["profiles"]) {
  if (!profile) return null
  return Array.isArray(profile) ? profile[0] ?? null : profile
}

export default function ScreenDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [screen, setScreen] = useState<ScreenDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({
    start_date: "",
    end_date: "",
    creative_url: "",
    creative_format: "",
    notes: "",
  })
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadScreen() {
      const { data } = await supabase
        .from("screens")
        .select("id, name, description, screen_type, city, area, address, width_meters, height_meters, resolution_width, resolution_height, operating_hours_start, operating_hours_end, price_per_day, screen_images(url, is_primary), profiles(company_name, full_name)")
        .eq("id", params.id)
        .eq("status", "active")
        .single()

      setScreen(data)
      setLoading(false)
    }

    loadScreen()
  }, [params.id, supabase])

  const totalDays = useMemo(() => {
    if (!booking.start_date || !booking.end_date) return 0
    const start = new Date(`${booking.start_date}T00:00:00`)
    const end = new Date(`${booking.end_date}T00:00:00`)
    const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    return Math.max(diff, 0)
  }, [booking.end_date, booking.start_date])

  const amounts = screen && totalDays > 0
    ? calculateBookingAmount(Number(screen.price_per_day), totalDays)
    : { subtotal: 0, platformFee: 0, total: 0 }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage("")

    if (!screen || totalDays <= 0) {
      setMessage("Choose valid start and end dates.")
      return
    }

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?next=/screens/${screen.id}`)
      return
    }

    const { error } = await supabase.from("bookings").insert({
      reference: generateBookingReference(),
      advertiser_id: user.id,
      screen_id: screen.id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      total_days: totalDays,
      amount_subtotal: amounts.subtotal,
      platform_fee: amounts.platformFee,
      amount_total: amounts.total,
      creative_url: booking.creative_url || null,
      creative_format: booking.creative_format || null,
      notes: booking.notes || null,
    })

    setSubmitting(false)
    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Booking request created. The media owner can now review it.")
    setBooking({ start_date: "", end_date: "", creative_url: "", creative_format: "", notes: "" })
  }

  if (loading) {
    return (
      <AppShell eyebrow="Screen Details" title="Loading screen">
        <div className="card" style={{ padding: "var(--space-10)", color: "var(--text-muted)" }}>Loading...</div>
      </AppShell>
    )
  }

  if (!screen) {
    return (
      <AppShell eyebrow="Screen Details" title="Screen not found">
        <div className="card" style={{ padding: "var(--space-10)" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>This screen is unavailable or has not been approved yet.</p>
          <Link href="/screens" className="btn btn-primary">Back to screens</Link>
        </div>
      </AppShell>
    )
  }

  const primaryImage = screen.screen_images?.find(image => image.is_primary) ?? screen.screen_images?.[0]
  const owner = firstProfile(screen.profiles)

  return (
    <AppShell
      eyebrow="Screen Details"
      title={screen.name}
      description={`${screen.area ? `${screen.area}, ` : ""}${screen.city} · ${getScreenTypeLabel(screen.screen_type)}`}
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.7fr)", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="card"
            style={{
              minHeight: 360,
              backgroundImage: primaryImage ? `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.08)), url(${primaryImage.url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h2 className="t-heading" style={{ marginBottom: 10 }}>Location and specs</h2>
            <p className="t-body" style={{ marginBottom: 20 }}>{screen.description ?? screen.address}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              {[
                ["Address", screen.address],
                ["Owner", owner?.company_name ?? owner?.full_name ?? "Media owner"],
                ["Operating hours", `${screen.operating_hours_start.slice(0, 5)} - ${screen.operating_hours_end.slice(0, 5)}`],
                ["Resolution", screen.resolution_width && screen.resolution_height ? `${screen.resolution_width} x ${screen.resolution_height}` : "Not listed"],
                ["Physical size", screen.width_meters && screen.height_meters ? `${screen.width_meters}m x ${screen.height_meters}m` : "Not listed"],
                ["Daily rate", formatCurrency(Number(screen.price_per_day))],
              ].map(([label, value]) => (
                <div key={label} className="stat-card" style={{ padding: "var(--space-4)" }}>
                  <p className="stat-card-label">{label}</p>
                  <p style={{ color: "var(--text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated" style={{ padding: "var(--space-6)", alignSelf: "start" }}>
          <h2 className="t-heading" style={{ marginBottom: 8 }}>Request booking</h2>
          <p className="t-body-sm" style={{ marginBottom: 20 }}>Submit dates and creative details for owner approval.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Start date</label>
              <input className="input" type="date" value={booking.start_date} onChange={event => setBooking({ ...booking, start_date: event.target.value })} required />
            </div>
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>End date</label>
              <input className="input" type="date" value={booking.end_date} onChange={event => setBooking({ ...booking, end_date: event.target.value })} required />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Creative URL</label>
            <input className="input" type="url" placeholder="https://..." value={booking.creative_url} onChange={event => setBooking({ ...booking, creative_url: event.target.value })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Creative format</label>
            <input className="input" placeholder="Image, video, 1080x1920..." value={booking.creative_format} onChange={event => setBooking({ ...booking, creative_format: event.target.value })} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Notes</label>
            <textarea className="input" rows={4} placeholder="Campaign objective, preferred rotation, timing..." value={booking.notes} onChange={event => setBooking({ ...booking, notes: event.target.value })} />
          </div>

          <div className="card" style={{ padding: "var(--space-4)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="t-body-sm">Days</span>
              <strong>{totalDays}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="t-body-sm">Subtotal</span>
              <strong>{formatCurrency(amounts.subtotal)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="t-body-sm">Platform fee</span>
              <strong>{formatCurrency(amounts.platformFee)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent)" }}>
              <span>Total</span>
              <strong>{formatCurrency(amounts.total)}</strong>
            </div>
          </div>

          {message && (
            <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", marginBottom: 16 }}>
              {message}
            </div>
          )}

          <button className="btn btn-primary btn-lg" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
            {submitting ? "Submitting..." : "Request booking"}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
