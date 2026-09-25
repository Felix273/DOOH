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
  latitude: number
  longitude: number
  width_meters: number | null
  height_meters: number | null
  resolution_width: number | null
  resolution_height: number | null
  operating_hours_start: string
  operating_hours_end: string
  price_per_day: number
  daily_footfall: number | null
  daily_impressions: number | null
  audience_source: string | null
  audience_updated_at: string | null
  screen_images?: { url: string; is_primary: boolean }[]
  profiles?: { company_name: string | null; full_name: string | null } | { company_name: string | null; full_name: string | null }[] | null
}

type BookingRange = {
  start_date: string
  end_date: string
}

function firstProfile(profile: ScreenDetail["profiles"]) {
  if (!profile) return null
  return Array.isArray(profile) ? profile[0] ?? null : profile
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00`)
}

function formatAudience(value: number | null) {
  if (value === null || value === undefined) return "Not yet verified"
  return new Intl.NumberFormat("en-KE").format(value)
}

function formatDate(value: string | null) {
  if (!value) return "Not provided"
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(parseDateKey(value))
}

function bookingErrorMessage(error: { code?: string; message?: string }) {
  if (error.code === "23P01" || error.message?.includes("bookings_no_overlapping_active_periods")) {
    return "Those dates were just taken by another campaign. Please choose a different available range."
  }

  return error.message ?? "We could not create the booking request. Please try again."
}

function AvailabilityCalendar({
  ranges,
  startDate,
  endDate,
  onSelect,
}: {
  ranges: BookingRange[]
  startDate: string
  endDate: string
  onSelect: (date: string) => void
}) {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    const startOffset = firstDay.getDay()
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index - startOffset + 1)
      const key = toDateKey(date)
      const unavailable = ranges.some(range => key >= range.start_date && key <= range.end_date)
      const today = toDateKey(new Date())
      return {
        date,
        key,
        inMonth: date.getMonth() === month.getMonth(),
        unavailable,
        past: key < today,
        selected: key === startDate || key === endDate || (Boolean(startDate && endDate) && key > startDate && key < endDate),
        endpoint: key === startDate || key === endDate,
      }
    })
  }, [endDate, month, ranges, startDate])

  const monthLabel = new Intl.DateTimeFormat("en-KE", { month: "long", year: "numeric" }).format(month)
  const isCurrentMonth = month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth()

  return (
    <div className="availability-calendar" aria-label="Screen availability calendar">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} disabled={isCurrentMonth} aria-label="Previous month">←</button>
        <strong style={{ color: "var(--text-primary)" }}>{monthLabel}</strong>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">→</button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {days.map(day => {
          const disabled = !day.inMonth || day.past || day.unavailable
          return (
            <button
              key={day.key}
              type="button"
              className={`calendar-day${day.selected ? " is-selected" : ""}${day.endpoint ? " is-endpoint" : ""}${day.unavailable ? " is-unavailable" : ""}${!day.inMonth ? " is-outside" : ""}`}
              disabled={disabled}
              onClick={() => onSelect(day.key)}
              aria-label={`${day.key}${day.unavailable ? ", unavailable" : day.past ? ", past date" : ""}`}
              aria-pressed={day.selected}
            >
              {day.date.getDate()}
            </button>
          )
        })}
      </div>
      <div className="calendar-legend" aria-label="Calendar legend">
        <span><i className="calendar-legend-dot is-available" />Available</span>
        <span><i className="calendar-legend-dot is-unavailable" />Booked or pending</span>
        <span><i className="calendar-legend-dot is-selected" />Your dates</span>
      </div>
    </div>
  )
}

export default function ScreenDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [screen, setScreen] = useState<ScreenDetail | null>(null)
  const [ranges, setRanges] = useState<BookingRange[]>([])
  const [loading, setLoading] = useState(true)
  const [availabilityError, setAvailabilityError] = useState("")
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
    const timer = window.setTimeout(() => {
      void (async () => {
        const { data, error } = await supabase
          .from("screens")
          .select("id, name, description, screen_type, city, area, address, latitude, longitude, width_meters, height_meters, resolution_width, resolution_height, operating_hours_start, operating_hours_end, price_per_day, daily_footfall, daily_impressions, audience_source, audience_updated_at, screen_images(url, is_primary), profiles(company_name, full_name)")
          .eq("id", params.id)
          .eq("status", "active")
          .single()

        if (!error && data) {
          setScreen(data)
          const { data: availability, error: availabilityQueryError } = await supabase.rpc("get_screen_booking_ranges", { target_screen_id: params.id })
          if (availabilityQueryError) {
            setAvailabilityError("Availability could not be loaded. You can still request dates, and the owner will confirm them.")
          } else {
            setRanges(availability ?? [])
          }
        }
        setLoading(false)
      })()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [params.id, supabase])

  const totalDays = useMemo(() => {
    if (!booking.start_date || !booking.end_date) return 0
    const start = parseDateKey(booking.start_date)
    const end = parseDateKey(booking.end_date)
    const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    return Math.max(diff, 0)
  }, [booking.end_date, booking.start_date])

  const selectedRangeHasUnavailableDate = useMemo(() => {
    if (!booking.start_date || !booking.end_date) return false
    return ranges.some(range => range.start_date <= booking.end_date && range.end_date >= booking.start_date)
  }, [booking.end_date, booking.start_date, ranges])

  const amounts = screen && totalDays > 0
    ? calculateBookingAmount(Number(screen.price_per_day), totalDays)
    : { subtotal: 0, platformFee: 0, total: 0 }

  const selectCalendarDate = (date: string) => {
    if (!booking.start_date || booking.end_date || date < booking.start_date) {
      setBooking({ ...booking, start_date: date, end_date: "" })
      return
    }
    setBooking({ ...booking, end_date: date })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage("")

    if (!screen || totalDays <= 0) {
      setMessage("Choose valid start and end dates.")
      return
    }

    if (selectedRangeHasUnavailableDate) {
      setMessage("Those dates overlap a booked or pending period. Choose another range.")
      return
    }

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSubmitting(false)
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
      setMessage(bookingErrorMessage(error))
      return
    }

    setMessage("Booking request created. The media owner can now review it.")
    setBooking({ start_date: "", end_date: "", creative_url: "", creative_format: "", notes: "" })
  }

  if (loading) {
    return (
      <AppShell eyebrow="Screen Details" title="Loading screen">
        <div className="card" style={{ padding: "var(--space-10)", color: "var(--text-secondary)" }}>Loading screen details and availability...</div>
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
  const mapUrl = `https://www.openstreetmap.org/?mlat=${screen.latitude}&mlon=${screen.longitude}#map=17/${screen.latitude}/${screen.longitude}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${screen.latitude},${screen.longitude}`

  return (
    <AppShell
      eyebrow="Screen Details"
      title={screen.name}
      description={`${screen.area ? `${screen.area}, ` : ""}${screen.city} · ${getScreenTypeLabel(screen.screen_type)}`}
    >
      <div className="screen-detail-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.7fr)", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="card"
            role="img"
            aria-label={`${screen.name} screen image`}
            style={{
              minHeight: 360,
              backgroundImage: primaryImage ? `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.08)), url(${primaryImage.url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="card" style={{ padding: "var(--space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <h2 className="t-heading">Location and specs</h2>
                <p className="t-body" style={{ marginTop: 8 }}>{screen.description ?? screen.address}</p>
              </div>
              <span className="badge badge-live">Active</span>
            </div>
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

          <div className="card" style={{ padding: "var(--space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 className="t-heading">Location map</h2>
                <p className="t-body-sm" style={{ marginTop: 6 }}>Approximate screen coordinates are provided for planning. Confirm the exact placement with the media owner before launch.</p>
              </div>
              <span className="badge badge-info">{screen.city}</span>
            </div>
            <div className="map-preview" aria-label={`Map location for ${screen.name}`}>
              <div className="map-grid" aria-hidden="true" />
              <div className="map-pin" aria-hidden="true">●</div>
              <div className="map-label">{screen.area ? `${screen.area}, ` : ""}{screen.city}</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              <a className="btn btn-secondary btn-sm" href={mapUrl} target="_blank" rel="noreferrer">Open map ↗</a>
              <a className="btn btn-secondary btn-sm" href={directionsUrl} target="_blank" rel="noreferrer">Get directions ↗</a>
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 className="t-heading">Audience estimates</h2>
                <p className="t-body-sm" style={{ marginTop: 6 }}>Use these figures for planning, not as a guaranteed delivery. Ask the media owner for the methodology and latest verification before committing budget.</p>
              </div>
              <span className="badge badge-info">Planning data</span>
            </div>
            <div className="audience-grid">
              <div className="stat-card" style={{ padding: "var(--space-5)" }}>
                <p className="stat-card-label">Daily footfall</p>
                <p className="audience-value">{formatAudience(screen.daily_footfall)}</p>
                <p className="t-body-sm">Estimated people passing the location</p>
              </div>
              <div className="stat-card" style={{ padding: "var(--space-5)" }}>
                <p className="stat-card-label">Daily impressions</p>
                <p className="audience-value">{formatAudience(screen.daily_impressions)}</p>
                <p className="t-body-sm">Estimated opportunities to see</p>
              </div>
            </div>
            <p className="t-body-sm" style={{ marginTop: 14 }}>Source: {screen.audience_source ?? "Not provided"} · Verified: {formatDate(screen.audience_updated_at)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated" style={{ padding: "var(--space-6)", alignSelf: "start" }}>
          <h2 className="t-heading" style={{ marginBottom: 8 }}>Request booking</h2>
          <p className="t-body-sm" style={{ marginBottom: 20 }}>Select available dates and submit a request for owner approval. A request is not a confirmed booking until approved.</p>

          {availabilityError ? (
            <div role="status" style={{ padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--accent-dim)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", marginBottom: 16 }}>{availabilityError}</div>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <AvailabilityCalendar ranges={ranges} startDate={booking.start_date} endDate={booking.end_date} onSelect={selectCalendarDate} />
              <p className="t-body-sm" style={{ marginTop: 10 }}>Choose a start date, then an end date. Booked and pending dates cannot be selected.</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label className="t-label" htmlFor="start-date" style={{ display: "block", marginBottom: 6 }}>Start date</label>
              <input id="start-date" className="input" type="date" min={toDateKey(new Date())} value={booking.start_date} onChange={event => setBooking({ ...booking, start_date: event.target.value })} required />
            </div>
            <div>
              <label className="t-label" htmlFor="end-date" style={{ display: "block", marginBottom: 6 }}>End date</label>
              <input id="end-date" className="input" type="date" min={booking.start_date || toDateKey(new Date())} value={booking.end_date} onChange={event => setBooking({ ...booking, end_date: event.target.value })} required />
            </div>
          </div>

          {selectedRangeHasUnavailableDate && <p role="alert" style={{ color: "var(--status-error)", fontSize: 13, marginBottom: 14 }}>Your selected dates overlap a booked or pending period.</p>}

          <div style={{ marginBottom: 12 }}>
            <label className="t-label" htmlFor="creative-url" style={{ display: "block", marginBottom: 6 }}>Creative URL</label>
            <input id="creative-url" className="input" type="url" placeholder="https://..." value={booking.creative_url} onChange={event => setBooking({ ...booking, creative_url: event.target.value })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="t-label" htmlFor="creative-format" style={{ display: "block", marginBottom: 6 }}>Creative format</label>
            <input id="creative-format" className="input" placeholder="Image, video, 1080x1920..." value={booking.creative_format} onChange={event => setBooking({ ...booking, creative_format: event.target.value })} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="t-label" htmlFor="booking-notes" style={{ display: "block", marginBottom: 6 }}>Notes</label>
            <textarea id="booking-notes" className="input" rows={4} placeholder="Campaign objective, preferred rotation, timing..." value={booking.notes} onChange={event => setBooking({ ...booking, notes: event.target.value })} />
          </div>

          <div className="card" style={{ padding: "var(--space-4)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span className="t-body-sm">Days</span><strong>{totalDays}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span className="t-body-sm">Subtotal</span><strong>{formatCurrency(amounts.subtotal)}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span className="t-body-sm">Platform fee</span><strong>{formatCurrency(amounts.platformFee)}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent)" }}><span>Total estimate</span><strong>{formatCurrency(amounts.total)}</strong></div>
          </div>

          {message && <div role="status" style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", marginBottom: 16 }}>{message}</div>}

          <button className="btn btn-primary btn-lg" disabled={submitting || selectedRangeHasUnavailableDate} style={{ width: "100%", justifyContent: "center" }}>
            {submitting ? "Submitting..." : "Request booking"}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
